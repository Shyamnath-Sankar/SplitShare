import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Receipt, ArrowRightLeft, Utensils, Plane, Zap, Home, Film, ShoppingCart, Tag } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';

const categoryIcons: Record<string, { icon: any, bg: string, text: string }> = {
  'Food & Drink': { icon: Utensils, bg: 'bg-[#046c65]', text: 'text-white' },
  'Groceries': { icon: ShoppingCart, bg: 'bg-[#e2e8e9]', text: 'text-[#385150]' },
  'Travel': { icon: Plane, bg: 'bg-[#eef2ef]', text: 'text-[#4e6456]' },
  'Utilities': { icon: Zap, bg: 'bg-[#bce0d5]', text: 'text-[#1a382e]' },
  'Rent': { icon: Home, bg: 'bg-[#d2dcda]', text: 'text-[#2f4f4f]' },
  'Entertainment': { icon: Film, bg: 'bg-[#c5ddd8]', text: 'text-[#2a4542]' },
  'General': { icon: Tag, bg: 'bg-[#e8ecec]', text: 'text-[#586968]' },
};

export default function RecentActivity() {
  const { expenses, users } = useData();
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 }
  };

  const currencySymbol = getCurrencySymbol(userProfile?.currency);

  const getDayGroup = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return 'TODAY';
    if (isYesterday(d)) return 'YESTERDAY';
    return format(d, 'MMM d, yyyy').toUpperCase();
  };

  const groupedExpenses = expenses.reduce((acc: Record<string, any[]>, exp) => {
    let dateStr = new Date().toISOString();
    if (exp.date && exp.date.toDate) {
      dateStr = exp.date.toDate().toISOString();
    }
    const group = getDayGroup(dateStr);
    if (!acc[group]) acc[group] = [];
    acc[group].push(exp);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedExpenses).sort((a, b) => {
    if (a === 'TODAY') return -1;
    if (b === 'TODAY') return 1;
    if (a === 'YESTERDAY') return -1;
    if (b === 'YESTERDAY') return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-lg mx-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#798a83] mb-1">Ledger Overview</h2>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a2d2a]">Recent Activity</h1>
        </div>
      </div>

      <div className="space-y-8">
        {expenses.length === 0 ? (
          <div className="rounded-3xl bg-[#f5f7f6] p-12 text-center border border-slate-100">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaeeee] mx-auto">
              <Receipt className="h-6 w-6 text-[#798a83]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a2d2a]">No activity yet</h3>
            <p className="mt-2 text-sm text-[#6e8581] max-w-xs mx-auto">Add an expense or settle up with a friend to see your activity here.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {sortedGroups.map((groupDate) => (
              <div key={groupDate} className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6e8581] pl-1">{groupDate}</h3>
                <div className="space-y-3">
                  {groupedExpenses[groupDate].map((exp) => {
                    const mySplit = exp.splits[currentUser.uid];
                    const myNet = mySplit ? mySplit.paid - mySplit.owed : 0;
                    const creator = users[exp.creatorId];
                    const payer = exp.payerId ? users[exp.payerId] : creator;
                    const isSettlement = exp.type === 'settlement';
                    const cat = categoryIcons[exp.category || 'General'] || categoryIcons['General'];
                    const CatIcon = isSettlement ? ArrowRightLeft : cat.icon;
                    
                    const catBg = isSettlement ? 'bg-[#c5ddd8]' : cat.bg;
                    const catText = isSettlement ? 'text-[#2a4542]' : cat.text;

                    const totalAmount = Object.values(exp.splits).reduce((sum, s: any) => sum + s.owed, 0) as number;
                    const numPeople = Object.keys(exp.splits).length;

                    return (
                      <motion.div variants={itemVariants} key={exp.id} className="flex items-center justify-between p-4 rounded-3xl bg-[#f7f9f8] hover:bg-[#f0f4f3] transition-colors gap-3">
                        <div className="flex items-center gap-4">
                          <div className={clsx(
                            "flex h-12 w-12 items-center justify-center rounded-[14px] shrink-0",
                            catBg, catText
                          )}>
                            <CatIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-[#1a2d2a] truncate">{exp.description}</p>
                            <p className="text-xs text-[#6e8581] mt-0.5 truncate flex items-center gap-1">
                              {payer?.uid === currentUser.uid ? 'You' : (payer?.displayName || 'Someone')} paid {currencySymbol}{totalAmount.toFixed(2)} 
                              <span className="hidden sm:inline"> • {isSettlement ? 'Settled' : `Split with ${numPeople} people`}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          {myNet > 0 ? (
                            <>
                              <span className="font-bold text-[#076c65] text-base block mb-0.5">+{currencySymbol}{myNet.toFixed(2)}</span>
                              <span className="text-[9px] text-[#798a83] block font-bold uppercase tracking-widest">Owed to you</span>
                            </>
                          ) : myNet < 0 ? (
                            <>
                              <span className="font-bold text-[#b53f3f] text-base block mb-0.5">{currencySymbol}{Math.abs(myNet).toFixed(2)}</span>
                              {isSettlement ? (
                                <span className="text-[9px] text-[#c76565] block font-bold uppercase tracking-widest">Settled</span>
                              ) : (
                                <span className="text-[9px] text-[#798a83] block font-bold uppercase tracking-widest">You owe</span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-[#6e8581] text-base block mb-0.5">{currencySymbol}0.00</span>
                              <span className="text-[9px] text-[#93a6a1] block font-bold uppercase tracking-widest">Even</span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
