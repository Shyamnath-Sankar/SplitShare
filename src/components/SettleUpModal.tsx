import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { X, ArrowRightLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';
import { Expense } from '../types';

export default function SettleUpModal({ onClose, prefillUserId, prefillAmount, initialExpense, isReadOnly }: { onClose: () => void, prefillUserId?: string, prefillAmount?: number, initialExpense?: Expense, isReadOnly?: boolean }) {
  const { addExpense, editExpense, deleteExpense, groups, users } = useData();
  const { currentUser, userProfile } = useAuth();
  
  const [amount, setAmount] = useState(initialExpense?.amount?.toString() || (prefillAmount ? prefillAmount.toString() : ''));
  const [selectedFriend, setSelectedFriend] = useState<string>(
    initialExpense ? initialExpense.participants.find(p => p !== currentUser?.uid) || '' : (prefillUserId || '')
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(initialExpense?.paymentMethod || 'Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const friendsIds = Array.from(new Set(groups.flatMap(g => g.members))).filter(id => id !== currentUser.uid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedFriend || isSubmitting) return;

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const splits: Record<string, { paid: number; owed: number }> = {
        [currentUser.uid]: { paid: totalAmount, owed: 0 },
        [selectedFriend]: { paid: 0, owed: totalAmount }
      };

      const expenseData = {
        description: 'Payment',
        amount: totalAmount,
        payerId: currentUser.uid,
        participants: [currentUser.uid, selectedFriend],
        splits,
        type: 'settlement' as const,
        paymentMethod
      };

      if (initialExpense) {
        await editExpense(initialExpense.id, expenseData);
      } else {
        await addExpense({
          ...expenseData,
          date: new Date(),
          creatorId: currentUser.uid
        });
      }

      onClose();
    } catch (error) {
      console.error("Error settling up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencySymbol = getCurrencySymbol(userProfile?.currency);
  const selectedUserUpi = selectedFriend && users[selectedFriend]?.upiId;
  const upiLink = selectedUserUpi && amount ? `upi://pay?pa=${selectedUserUpi}&pn=${encodeURIComponent(users[selectedFriend]?.displayName || 'Friend')}&am=${amount}` : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl glass-strong shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] mt-auto sm:mt-0"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4 sm:px-6 sm:py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-[var(--color-brand)] border border-slate-200">
                <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {isReadOnly ? 'Payment Details' : (initialExpense ? 'Edit Payment' : 'Settle up')}
              </h2>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100/80 hover:text-slate-600 transition-all active-bounce" disabled={isSubmitting}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
            {/* Avatar exchange */}
            <div className="flex items-center justify-center gap-5 py-4">
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 font-bold text-xl shadow-sm overflow-hidden">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    currentUser.displayName?.[0]?.toUpperCase() || 'Y'
                  )}
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-500">You</span>
              </div>
              <motion.div
                animate={{ x: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRightLeft className="h-6 w-6 text-slate-300" />
              </motion.div>
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold text-xl shadow-sm overflow-hidden">
                  {selectedFriend && users[selectedFriend]?.photoURL ? (
                    <img src={users[selectedFriend].photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    selectedFriend ? users[selectedFriend]?.displayName?.[0]?.toUpperCase() : '?'
                  )}
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-500">
                  {selectedFriend ? users[selectedFriend]?.displayName?.split(' ')[0] : 'Friend'}
                </span>
              </div>
            </div>

            {/* Friend select */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">You paid to:</label>
              <select
                required
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                disabled={isSubmitting || isReadOnly}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 outline-none transition-all bg-white disabled:opacity-50"
              >
                <option value="" disabled>Select a friend...</option>
                {/* Ensure prefilled user is always displayed even if not in groups */}
                {prefillUserId && !friendsIds.includes(prefillUserId) && (
                  <option key={prefillUserId} value={prefillUserId}>{users[prefillUserId]?.displayName || prefillUserId}</option>
                )}
                {initialExpense && selectedFriend && !friendsIds.includes(selectedFriend) && (
                   <option key={selectedFriend} value={selectedFriend}>{users[selectedFriend]?.displayName || selectedFriend}</option>
                )}
                {friendsIds.map(id => (
                  <option key={id} value={id}>{users[id]?.displayName || id}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">{currencySymbol}</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting || isReadOnly}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-3 text-xl focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 outline-none transition-all font-bold text-slate-900 bg-white shadow-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isSubmitting || isReadOnly}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white disabled:opacity-50"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-200/60 shrink-0">
              {selectedFriend && !isReadOnly && (
                upiLink ? (
                  <a
                    href={upiLink}
                    target="_blank"
                    onClick={() => setPaymentMethod('UPI')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 sm:py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all active-bounce shadow-md"
                  >
                     Pay via UPI
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 sm:py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed border border-slate-200"
                  >
                     UPI Not Linked by Friend
                  </button>
                )
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                {isReadOnly ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto flex-1 rounded-xl px-5 py-3 sm:py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors active-bounce"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        if (initialExpense && window.confirm("Are you sure you want to delete this payment?")) {
                          setIsSubmitting(true);
                          await deleteExpense(initialExpense.id);
                          setIsSubmitting(false);
                          onClose();
                        } else if (!initialExpense) {
                          onClose();
                        }
                      }}
                      disabled={isSubmitting}
                      className={`w-full sm:flex-1 rounded-xl px-5 py-3 sm:py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 active-bounce ${initialExpense ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100' : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'}`}
                    >
                      {initialExpense ? 'Delete' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-[2] flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 sm:py-2.5 text-sm font-semibold text-white transition-all shadow-[var(--shadow-glow-brand)] hover:shadow-lg active-bounce disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        initialExpense ? 'Save Changes' : 'Record Payment'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
