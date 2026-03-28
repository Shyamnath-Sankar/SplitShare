import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownLeft, Wallet, CheckCircle2, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import SettleUpModal from '../components/SettleUpModal';
import { motion } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';

export default function Dashboard() {
  const { expenses, users, groups } = useData();
  const { currentUser, userProfile } = useAuth();
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  if (!currentUser) return null;

  const activeGroups = groups.filter(g => g.members.includes(currentUser.uid));

  const filteredExpenses = selectedGroupId === 'all' 
    ? expenses 
    : expenses.filter(e => e.groupId === selectedGroupId);

  let totalOwedToMe = 0;
  let totalIOwe = 0;

  const balances: Record<string, number> = {};

  filteredExpenses.forEach(exp => {
    const mySplit = exp.splits[currentUser.uid];
    if (!mySplit) return;

    const myNet = mySplit.paid - mySplit.owed;
    if (myNet === 0) return;

    const others = Object.entries(exp.splits).filter(([uid]) => uid !== currentUser.uid) as [string, { paid: number; owed: number }][];
    
    if (others.length === 1) {
      const [otherId] = others[0];
      balances[otherId] = (balances[otherId] || 0) + myNet;
    } else {
      const totalPositive = Object.values(exp.splits).reduce((sum: number, s: any) => sum + Math.max(0, s.paid - s.owed), 0) as number;
      
      others.forEach(([otherId, otherSplit]) => {
        const otherNet = otherSplit.paid - otherSplit.owed;
        if (myNet > 0 && otherNet < 0) {
          const proportion = myNet / totalPositive;
          balances[otherId] = (balances[otherId] || 0) + (Math.abs(otherNet) * proportion);
        } else if (myNet < 0 && otherNet > 0) {
          const proportion = otherNet / totalPositive;
          balances[otherId] = (balances[otherId] || 0) - (Math.abs(myNet) * proportion);
        }
      });
    }
  });

  let totalNetBalance = 0;
  Object.values(balances).forEach(bal => {
    totalNetBalance += bal;
    if (bal > 0.01) totalOwedToMe += bal;
    if (bal < -0.01) totalIOwe += Math.abs(bal);
  });

  const youOweList = Object.entries(balances).filter(([_, bal]) => bal < -0.01);
  const youAreOwedList = Object.entries(balances).filter(([_, bal]) => bal > 0.01);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const currencySymbol = getCurrencySymbol(userProfile?.currency);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8 max-w-lg mx-auto pb-[calc(4rem+env(safe-area-inset-bottom))]"
    >
      {/* Total Balance Card */}
      <motion.div variants={itemVariants} className="rounded-3xl bg-gradient-to-br from-white to-[#f4f9f7] p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#5a716f] mb-1">Total Net Balance</h2>
        <p className={clsx(
          "text-4xl sm:text-5xl font-bold tracking-tight mb-2",
          totalNetBalance > 0.01 ? "text-[#066c62]" : totalNetBalance < -0.01 ? "text-rose-600" : "text-[#044d4b]"
        )}>
          {currencySymbol}{Math.abs(totalNetBalance).toFixed(2)}
        </p>
        <div className="flex items-center gap-2 text-sm text-[#486360] mb-6">
          <TrendingUp className="h-4 w-4" />
          <span>Track your overall net balance</span>
        </div>
        <button
          onClick={() => setIsSettleModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#044d4b] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#033f3d] active:scale-[0.98] w-40"
        >
          <Wallet className="h-4 w-4" />
          Settle Up
        </button>
      </motion.div>

      {/* Owed / Owe Cards */}
      <div className="grid gap-4">
        {/* You Are Owed */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#cfe6d6] p-5 shadow-sm relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b8cfbf]">
              <ArrowDownLeft className="h-4 w-4 text-[#43644f]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#668673]">Receivable</span>
          </div>
          <h2 className="text-sm font-medium text-[#486b55] mb-1">You are owed</h2>
          <p className="text-3xl font-bold text-[#355140] tracking-tight">
            {currencySymbol}{totalOwedToMe.toFixed(2)}
          </p>
        </motion.div>

        {/* You Owe */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#e5ebe8] p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d0d6d3]">
              <ArrowUpRight className="h-4 w-4 text-[#596660]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#798a83]">Payable</span>
          </div>
          <h2 className="text-sm font-medium text-[#5a6b63] mb-1">You owe</h2>
          <p className="text-3xl font-bold text-[#303f38] tracking-tight">
            {currencySymbol}{totalIOwe.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Recent Contacts */}
      <motion.div variants={containerVariants} className="pt-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-bold text-[#044d4b]">Recent Contacts</h3>
        </div>
        <div className="space-y-3">
          {youOweList.length === 0 && youAreOwedList.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">No recent contacts with balances.</p>
            </div>
          ) : (
            <>
              {youAreOwedList.slice(0, 3).map(([userId, bal]) => (
                <div key={userId} className="flex items-center justify-between p-4 rounded-2xl bg-[#f2f6f5]">
                  <div className="flex items-center gap-3">
                    {users[userId]?.photoURL ? (
                      <img src={users[userId].photoURL} alt="" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cfe6d6] text-[#486b55] font-bold">
                        {users[userId]?.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-[#1a2d2a]">{users[userId]?.displayName || 'Unknown'}</h4>
                      <p className="text-xs text-[#6e8581] uppercase tracking-wide mt-0.5">Owed to you</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#076c65] mb-0.5">Owes You</p>
                    <p className="text-lg font-bold text-[#076c65]">{currencySymbol}{bal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {youOweList.slice(0, 3).map(([userId, bal]) => (
                <div key={userId} className="flex items-center justify-between p-4 rounded-2xl bg-[#f2f6f5]">
                  <div className="flex items-center gap-3">
                    {users[userId]?.photoURL ? (
                      <img src={users[userId].photoURL} alt="" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4d7d7] text-[#8c4040] font-bold">
                        {users[userId]?.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-[#1a2d2a]">{users[userId]?.displayName || 'Unknown'}</h4>
                      <p className="text-xs text-[#6e8581] uppercase tracking-wide mt-0.5">You owe them</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#b53f3f] mb-0.5">You Owe</p>
                    <p className="text-lg font-bold text-[#b53f3f]">{currencySymbol}{Math.abs(bal).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>

      {/* Abstract shapes for decoration */}
      <motion.div variants={itemVariants} className="rounded-3xl bg-[#20494a] p-6 text-white shadow-lg overflow-hidden relative mt-4">
        <h3 className="text-lg font-bold mb-2">Keep it up!</h3>
        <p className="text-sm text-[#93b3b2] mb-6 max-w-[85%] leading-relaxed">
          Great job keeping your shared expenses organized. Settle up regularly to keep the books clean.
        </p>
        
        <div className="absolute bottom-0 right-4 flex items-end gap-1 opacity-20 pointer-events-none">
          <div className="w-4 h-12 bg-white rounded-t-sm" />
          <div className="w-4 h-8 bg-white rounded-t-sm" />
          <div className="w-4 h-16 bg-white rounded-t-sm" />
        </div>
      </motion.div>

      {isSettleModalOpen && (
        <SettleUpModal onClose={() => setIsSettleModalOpen(false)} />
      )}
    </motion.div>
  );
}
