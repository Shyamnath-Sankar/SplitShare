import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownLeft, Wallet, CheckCircle2, Filter, TrendingUp } from 'lucide-react';
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
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500">Here's where you stand with your friends.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {activeGroups.length > 0 && (
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full sm:w-auto appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-10 py-3 sm:py-2.5 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="all">All Groups</option>
                {activeGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => setIsSettleModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/80 px-5 py-3 sm:py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:shadow-md hover:shadow-emerald-500/10 active:scale-[0.97] border border-emerald-200/50"
          >
            <CheckCircle2 className="h-5 w-5" />
            Settle Up
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-3">
        {/* Total Balance – Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/8 blur-2xl" />
          <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-slate-400 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Wallet className="h-4 w-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider">Total balance</h2>
            </div>
            <p className={clsx(
              "text-3xl sm:text-4xl font-bold tracking-tight",
              totalNetBalance > 0.01 ? "text-emerald-400" : totalNetBalance < -0.01 ? "text-rose-400" : "text-white"
            )}>
              {totalNetBalance > 0.01 ? '+' : ''}{totalNetBalance < -0.01 ? '-' : ''}{currencySymbol}{Math.abs(totalNetBalance).toFixed(2)}
            </p>
            {totalNetBalance > 0.01 && (
              <div className="mt-2 flex items-center gap-1 text-emerald-400/70">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">You're in the green</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Owed / Owe cards */}
        <div className="grid grid-cols-2 sm:col-span-2 gap-4 sm:gap-5">
          <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-slate-100 card-hover">
            <div className="flex items-center gap-2 sm:gap-3 text-slate-500 mb-2 sm:mb-3">
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
                <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
              </div>
              <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">You are owed</h2>
            </div>
            <p className="text-xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 tracking-tight truncate">
              {currencySymbol}{totalOwedToMe.toFixed(2)}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-slate-100 card-hover">
            <div className="flex items-center gap-2 sm:gap-3 text-slate-500 mb-2 sm:mb-3">
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-rose-100">
                <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600" />
              </div>
              <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">You owe</h2>
            </div>
            <p className="text-xl sm:text-3xl lg:text-4xl font-bold text-rose-600 tracking-tight truncate">
              {currencySymbol}{totalIOwe.toFixed(2)}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Balance Lists */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* You Owe */}
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-8 sm:py-5 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">You owe</h3>
            {youOweList.length > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">{youOweList.length}</span>
            )}
          </div>
          <div className="flex-1 p-0">
            {youOweList.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="text-slate-500 font-medium">You're all settled up!</p>
                <p className="text-xs text-slate-400 mt-1">No pending balances</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {youOweList.map(([userId, bal]) => (
                  <li key={userId} className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {users[userId]?.photoURL ? (
                        <img src={users[userId].photoURL} alt="" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-200 object-cover ring-2 ring-white" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 font-bold text-sm">
                          {users[userId]?.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="font-semibold text-sm sm:text-base text-slate-800">{users[userId]?.displayName || 'Unknown'}</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-rose-600">{currencySymbol}{Math.abs(bal).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        {/* You Are Owed */}
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-8 sm:py-5 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">You are owed</h3>
            {youAreOwedList.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{youAreOwedList.length}</span>
            )}
          </div>
          <div className="flex-1 p-0">
            {youAreOwedList.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                  <Wallet className="h-7 w-7 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No one owes you anything.</p>
                <p className="text-xs text-slate-400 mt-1">All settled</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {youAreOwedList.map(([userId, bal]) => (
                  <li key={userId} className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {users[userId]?.photoURL ? (
                        <img src={users[userId].photoURL} alt="" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-200 object-cover ring-2 ring-white" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 font-bold text-sm">
                          {users[userId]?.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="font-semibold text-sm sm:text-base text-slate-800">{users[userId]?.displayName || 'Unknown'}</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-emerald-600">{currencySymbol}{bal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>

      {isSettleModalOpen && (
        <SettleUpModal onClose={() => setIsSettleModalOpen(false)} />
      )}
    </motion.div>
  );
}
