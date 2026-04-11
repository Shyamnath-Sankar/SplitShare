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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6', '#84cc16'];

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
      className="space-y-6 sm:space-y-8 w-full"
    >
      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <motion.div variants={itemVariants} className="rounded-3xl bg-[#044d4b] p-5 sm:p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#1a5b59] text-[#85dbcd] shrink-0 relative z-10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#85dbcd] uppercase tracking-widest mb-0.5">Total Spent</p>
            <p className="text-2xl font-bold text-white">{currencySymbol}{totalSpent.toFixed(2)}</p>
          </div>
          <TrendingUp className="absolute right-[-10%] bottom-[-20%] h-32 w-32 text-white/[0.03] pointer-events-none" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="rounded-3xl bg-[#f5f7f6] p-5 sm:p-6 border border-slate-100 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eaeeee] text-[#044d4b] shrink-0">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#6e8581] uppercase tracking-widest mb-0.5">Transactions</p>
            <p className="text-xl font-bold text-[#1a2d2a]">{expenseCount}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="rounded-3xl bg-[#f5f7f6] p-5 sm:p-6 border border-slate-100 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eaeeee] text-[#044d4b] shrink-0">
            <PieChartIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#6e8581] uppercase tracking-widest mb-0.5">Categories</p>
            <p className="text-xl font-bold text-[#1a2d2a]">{categoryData.length}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Category Breakdown */}
        <motion.div variants={itemVariants} className="rounded-3xl bg-[#f5f7f6] p-5 sm:p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaeeee]">
              <PieChartIcon className="h-5 w-5 text-[#044d4b]" />
            </div>
            <h2 className="text-base font-bold text-[#1a2d2a]">Spending by Category</h2>
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
        <motion.div variants={itemVariants} className="rounded-3xl bg-[#f5f7f6] p-5 sm:p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaeeee]">
              <BarChart3 className="h-5 w-5 text-[#044d4b]" />
            </div>
            <h2 className="text-base font-bold text-[#1a2d2a]">Monthly Spending</h2>
          </div>
          {monthlyData.length > 0 ? (
            <div className="h-[280px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8e9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6e8581', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6e8581', fontSize: 10 }} tickFormatter={(value) => `${currencySymbol}${value}`} width={40} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eaeeee' }} />
                  <Bar dataKey="value" name="Spent" fill="#044d4b" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-[#6e8581]">No data available</div>
          )}
        </motion.div>

        {/* Who Spent on Whom */}
        <motion.div variants={itemVariants} className="rounded-3xl bg-[#f5f7f6] p-5 sm:p-6 border border-slate-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaeeee]">
              <Users className="h-5 w-5 text-[#044d4b]" />
            </div>
            <h2 className="text-base font-bold text-[#1a2d2a]">Who Spent on Whom (Top 5)</h2>
          </div>
          {friendSpendingData.length > 0 ? (
            <div className="h-[280px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={friendSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8e9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6e8581', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6e8581', fontSize: 10 }} tickFormatter={(value) => `${currencySymbol}${value}`} width={40} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eaeeee' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="iPaidForThem" name="I paid for them" fill="#044d4b" radius={[4, 4, 0, 0]} maxBarSize={35} />
                  <Bar dataKey="theyPaidForMe" name="They paid for me" fill="#64938f" radius={[4, 4, 0, 0]} maxBarSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-[#6e8581]">No data available</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
