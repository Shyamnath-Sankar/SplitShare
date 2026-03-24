import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Users, Wallet } from 'lucide-react';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Analytics() {
  const { expenses, users } = useData();
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) return null;

  const currencySymbol = getCurrencySymbol(userProfile?.currency);

  const {
    totalSpent,
    categoryData,
    monthlyData,
    friendSpendingData,
    expenseCount,
  } = useMemo(() => {
    let totalSpent = 0;
    let expenseCount = 0;
    const categoryMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};
    const friendSpendingMap: Record<string, { name: string; iPaidForThem: number; theyPaidForMe: number }> = {};

    expenses.forEach(exp => {
      if (exp.type === 'settlement') return;

      const mySplit = exp.splits[currentUser.uid];
      const payerId = exp.payerId || exp.creatorId;

      if (mySplit) {
        totalSpent += mySplit.owed;
        expenseCount++;

        const cat = exp.category || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + mySplit.owed;

        const dateObj = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
        const monthKey = format(dateObj, 'MMM yyyy');
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + mySplit.owed;
      }

      if (payerId === currentUser.uid) {
        Object.entries(exp.splits).forEach(([uid, split]: [string, any]) => {
          if (uid !== currentUser.uid && split.owed > 0) {
            if (!friendSpendingMap[uid]) {
              friendSpendingMap[uid] = { name: users[uid]?.displayName || 'Unknown', iPaidForThem: 0, theyPaidForMe: 0 };
            }
            friendSpendingMap[uid].iPaidForThem += split.owed;
          }
        });
      } else {
        if (mySplit && mySplit.owed > 0) {
          if (!friendSpendingMap[payerId]) {
            friendSpendingMap[payerId] = { name: users[payerId]?.displayName || 'Unknown', iPaidForThem: 0, theyPaidForMe: 0 };
          }
          friendSpendingMap[payerId].theyPaidForMe += mySplit.owed;
        }
      }
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const monthlyData = Object.entries(monthlyMap)
      .map(([name, value]) => ({ name, value }));

    const friendSpendingData = Object.values(friendSpendingMap)
      .filter(d => d.iPaidForThem > 0 || d.theyPaidForMe > 0)
      .sort((a, b) => (b.iPaidForThem + b.theyPaidForMe) - (a.iPaidForThem + a.theyPaidForMe))
      .slice(0, 5);

    return { totalSpent, categoryData, monthlyData, friendSpendingData, expenseCount };
  }, [expenses, currentUser.uid, users]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
          <p className="font-semibold text-slate-900 mb-1 text-sm">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {currencySymbol}{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-500">Insights into your spending habits.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-3">
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100 flex items-center gap-4 card-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</p>
            <p className="text-2xl font-bold text-slate-900">{currencySymbol}{totalSpent.toFixed(2)}</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100 flex items-center gap-4 card-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions</p>
            <p className="text-2xl font-bold text-slate-900">{expenseCount}</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100 flex items-center gap-4 card-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shrink-0">
            <PieChartIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
            <p className="text-2xl font-bold text-slate-900">{categoryData.length}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Category Breakdown */}
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-50 to-violet-100">
              <PieChartIcon className="h-4 w-4 text-violet-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Spending by Category</h2>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-[280px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400">No data available</div>
          )}
        </motion.div>

        {/* Monthly Spending */}
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-50 to-sky-100">
              <BarChart3 className="h-4 w-4 text-sky-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Monthly Spending</h2>
          </div>
          {monthlyData.length > 0 ? (
            <div className="h-[280px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `${currencySymbol}${value}`} width={40} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Spent" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400">No data available</div>
          )}
        </motion.div>

        {/* Who Spent on Whom */}
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-50 to-rose-100">
              <Users className="h-4 w-4 text-rose-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Who Spent on Whom (Top 5)</h2>
          </div>
          {friendSpendingData.length > 0 ? (
            <div className="h-[280px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={friendSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `${currencySymbol}${value}`} width={40} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="iPaidForThem" name="I paid for them" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={35} />
                  <Bar dataKey="theyPaidForMe" name="They paid for me" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400">No data available</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
