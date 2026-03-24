// ... imports ...
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { X, Receipt, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';

export default function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const { addExpense, users, groups } = useData();
  const { currentUser, userProfile } = useAuth();
  
  if (!currentUser) return null;

  const activeGroups = groups.filter(g => g.members.includes(currentUser.uid));

  const [selectedGroup, setSelectedGroup] = useState<string>(activeGroups[0]?.id || '');
  const [category, setCategory] = useState<string>('General');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal');
  const [payerId, setPayerId] = useState<string>(currentUser.uid);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d{0,8}(\.\d{0,2})?$/.test(val)) {
      setAmount(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedGroup || isSubmitting) return;

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return;

    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return;
    const participants = group.members;

    const splits: Record<string, { paid: number; owed: number }> = {};
    
    if (splitType === 'equal') {
      const splitAmount = totalAmount / participants.length;
      participants.forEach(p => {
        splits[p] = {
          paid: p === payerId ? totalAmount : 0,
          owed: splitAmount
        };
      });
    } else if (splitType === 'exact') {
      let totalExact = 0;
      participants.forEach(p => {
        const amt = parseFloat(exactAmounts[p] || '0');
        totalExact += amt;
        splits[p] = {
          paid: p === payerId ? totalAmount : 0,
          owed: amt
        };
      });
      if (Math.abs(totalExact - totalAmount) > 0.01) {
        alert(`Exact amounts must sum up to the total amount. Currently: ${totalExact}`);
        return;
      }
    } else if (splitType === 'percentage') {
      let totalPercent = 0;
      participants.forEach(p => {
        const pct = parseFloat(percentages[p] || '0');
        totalPercent += pct;
        splits[p] = {
          paid: p === payerId ? totalAmount : 0,
          owed: (totalAmount * pct) / 100
        };
      });
      if (Math.abs(totalPercent - 100) > 0.01) {
        alert(`Percentages must sum up to 100%. Currently: ${totalPercent}%`);
        return;
      }
    } else if (splitType === 'shares') {
      let totalShares = 0;
      participants.forEach(p => {
        totalShares += parseFloat(shares[p] || '1');
      });
      if (totalShares <= 0) {
        alert('Total shares must be greater than 0.');
        return;
      }
      participants.forEach(p => {
        const share = parseFloat(shares[p] || '1');
        splits[p] = {
          paid: p === payerId ? totalAmount : 0,
          owed: (totalAmount * share) / totalShares
        };
      });
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        description: description || 'Group Expense',
        amount: totalAmount,
        date: new Date(),
        creatorId: currentUser.uid,
        payerId: payerId || currentUser.uid,
        groupId: selectedGroup,
        participants,
        splits,
        type: 'expense',
        category,
        paymentMethod,
        notes
      });

      onClose();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGroupMembers = groups.find(g => g.id === selectedGroup)?.members || [];

  const totalAmountForDisplay = parseFloat(amount) || 0;
  const currentSplits: Record<string, number> = {};
  
  if (splitType === 'equal') {
    const splitAmount = totalAmountForDisplay / (selectedGroupMembers.length || 1);
    selectedGroupMembers.forEach(p => currentSplits[p] = splitAmount);
  } else if (splitType === 'exact') {
    selectedGroupMembers.forEach(p => currentSplits[p] = parseFloat(exactAmounts[p] || '0') || 0);
  } else if (splitType === 'percentage') {
    selectedGroupMembers.forEach(p => currentSplits[p] = (totalAmountForDisplay * (parseFloat(percentages[p] || '0') || 0)) / 100);
  } else if (splitType === 'shares') {
    let totalShares = 0;
    selectedGroupMembers.forEach(p => totalShares += parseFloat(shares[p] || '1') || 0);
    selectedGroupMembers.forEach(p => {
      const share = parseFloat(shares[p] || '1') || 0;
      currentSplits[p] = totalShares > 0 ? (totalAmountForDisplay * share) / totalShares : 0;
    });
  }

  const currencySymbol = getCurrencySymbol(userProfile?.currency);

  const splitOptions = [
    { key: 'equal' as const, label: 'Equally' },
    { key: 'exact' as const, label: 'Exact' },
    { key: 'percentage' as const, label: 'Percent' },
    { key: 'shares' as const, label: 'Shares' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] mt-auto sm:mt-0"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden shrink-0" />
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-4 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Add an expense</h2>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90" disabled={isSubmitting}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {activeGroups.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-6">You need to be part of a group to add an expense.</p>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pb-6">
              
              {/* Group */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setPayerId(currentUser.uid);
                  }}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white disabled:opacity-50"
                  required
                >
                  {activeGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white disabled:opacity-50"
                >
                  <option value="General">General</option>
                  <option value="Food & Drink">Food & Drink</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Travel">Travel</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              {/* Amount – Large prominent input */}
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
                    onChange={handleAmountChange}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-3 text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-bold text-slate-900 bg-slate-50/50 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Split options */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Split options</label>
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                  {splitOptions.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSplitType(opt.key)}
                      disabled={isSubmitting}
                      className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-medium transition-all ${
                        splitType === opt.key
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      } disabled:opacity-50`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split details */}
              <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {splitType === 'equal' ? 'Split equally' : splitType === 'exact' ? 'Enter exact amounts' : splitType === 'percentage' ? 'Enter percentages' : 'Enter shares (default 1)'}
                </p>
                {selectedGroupMembers.map(p => (
                  <div key={p} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden shrink-0">
                        {users[p]?.photoURL ? (
                          <img src={users[p].photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                        ) : (
                          users[p]?.displayName?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700 truncate">{p === currentUser.uid ? 'You' : users[p]?.displayName || p}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-emerald-600 w-16 text-right">
                        {currencySymbol}{currentSplits[p]?.toFixed(2)}
                      </span>
                      {splitType !== 'equal' && (
                        <div className="relative w-20 sm:w-24">
                          {splitType === 'exact' && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>}
                          <input
                            type="number"
                            min="0"
                            step={splitType === 'shares' ? '0.5' : splitType === 'percentage' ? '1' : '0.01'}
                            max={splitType === 'percentage' ? '100' : undefined}
                            value={splitType === 'exact' ? (exactAmounts[p] || '') : splitType === 'percentage' ? (percentages[p] || '') : (shares[p] ?? '1')}
                            disabled={isSubmitting}
                            onChange={(e) => {
                              if (splitType === 'exact') setExactAmounts(prev => ({ ...prev, [p]: e.target.value }));
                              else if (splitType === 'percentage') setPercentages(prev => ({ ...prev, [p]: e.target.value }));
                              else setShares(prev => ({ ...prev, [p]: e.target.value }));
                            }}
                            className={`w-full rounded-lg border border-slate-200 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none disabled:opacity-50 ${
                              splitType === 'exact' ? 'pl-6 pr-2' : splitType === 'percentage' ? 'pl-2 pr-6' : 'px-2 text-center'
                            }`}
                            placeholder={splitType === 'shares' ? '1' : '0'}
                          />
                          {splitType === 'percentage' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Paid by */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Paid by</label>
                <select
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white disabled:opacity-50"
                >
                  {selectedGroupMembers.map(m => (
                    <option key={m} value={m}>{m === currentUser.uid ? 'You' : users[m]?.displayName || m}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dinner at Mario's"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white placeholder:text-slate-400 disabled:opacity-50"
                />
              </div>

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white disabled:opacity-50"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add details..."
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/50 p-3 sm:p-4 border border-emerald-100">
                <p className="text-xs sm:text-sm text-emerald-800 text-center">
                  Paid by <span className="font-semibold">{payerId === currentUser.uid ? 'you' : users[payerId]?.displayName || 'someone'}</span> and split <span className="font-semibold">{splitType}</span>.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl px-5 py-3 sm:py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors order-2 sm:order-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 sm:py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.97] order-1 sm:order-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Expense'
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
