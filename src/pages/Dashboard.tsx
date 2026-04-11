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
  const [settlePrefill, setSettlePrefill] = useState<{userId: string, amount: number} | null>(null);
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
      <motion.div variants={itemVariants} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden card-hover group">
        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity">
          <Wallet className="h-24 w-24 text-[--color-brand]" />
        </div>
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
          onClick={() => {
            setSettlePrefill(null);
            setIsSettleModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-white transition-all shadow-[var(--shadow-glow-brand)] hover:shadow-lg active-bounce w-40"
        >
          <Wallet className="h-4 w-4" />
          Settle Up
        </button>
      </motion.div>

      {/* Owed / Owe Cards */}
      <div className="grid gap-4">
        {/* You Are Owed */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 relative overflow-hidden flex flex-col card-hover">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100/80">
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
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col card-hover">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100/80">
              <ArrowUpRight className="h-4 w-4 text-rose-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Payable</span>
          </div>
          <h2 className="text-sm font-medium text-rose-700/80 mb-1">You owe</h2>
          <p className="text-3xl font-bold text-rose-700 tracking-tight">
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
                <div key={userId} className="flex items-center justify-between p-4 rounded-2xl glass card-hover">
                  <div className="flex items-center gap-3">
                    {users[userId]?.photoURL ? (
                      <img src={users[userId].photoURL} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold ring-2 ring-emerald-500/20">
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
                <div key={userId} className="flex items-center justify-between p-4 rounded-2xl glass card-hover">
                  <div className="flex items-center gap-3">
                    {users[userId]?.photoURL ? (
                      <img src={users[userId].photoURL} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-rose-500/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold ring-2 ring-rose-500/20">
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
                    <p className="text-lg font-bold text-[#b53f3f] mb-2">{currencySymbol}{Math.abs(bal).toFixed(2)}</p>
                    <button
                      onClick={() => {
                        setSettlePrefill({ userId, amount: Math.abs(bal) });
                        setIsSettleModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold active-bounce shadow-md shadow-rose-500/20"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>


      {isSettleModalOpen && (
        <SettleUpModal 
          onClose={() => {
            setIsSettleModalOpen(false);
            setSettlePrefill(null);
          }} 
          prefillUserId={settlePrefill?.userId}
          prefillAmount={settlePrefill?.amount}
        />
      )}
    </motion.div>
  );
}
