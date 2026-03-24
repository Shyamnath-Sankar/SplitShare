import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Receipt, ArrowRightLeft, Utensils, Plane, Zap, Home, Film, ShoppingCart, Tag } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';

const categoryIcons: Record<string, { icon: any, gradient: string }> = {
  'Food & Drink': { icon: Utensils, gradient: 'from-amber-50 to-amber-100 text-amber-600' },
  'Groceries': { icon: ShoppingCart, gradient: 'from-green-50 to-green-100 text-green-600' },
  'Travel': { icon: Plane, gradient: 'from-sky-50 to-sky-100 text-sky-600' },
  'Utilities': { icon: Zap, gradient: 'from-yellow-50 to-yellow-100 text-yellow-600' },
  'Rent': { icon: Home, gradient: 'from-indigo-50 to-indigo-100 text-indigo-600' },
  'Entertainment': { icon: Film, gradient: 'from-pink-50 to-pink-100 text-pink-600' },
  'General': { icon: Tag, gradient: 'from-slate-50 to-slate-100 text-slate-600' },
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Recent Activity</h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500">Your latest expenses and settlements.</p>
        </div>
        {expenses.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full hidden sm:block">
            {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <Receipt className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">No activity yet</h3>
            <p className="mt-2 text-slate-500 max-w-sm">Add an expense or settle up with a friend to see your activity here.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-50"
          >
            {expenses.map((exp) => {
              const mySplit = exp.splits[currentUser.uid];
              const myNet = mySplit ? mySplit.paid - mySplit.owed : 0;
              const creator = users[exp.creatorId];
              const payer = exp.payerId ? users[exp.payerId] : creator;
              const isSettlement = exp.type === 'settlement';
              const cat = categoryIcons[exp.category || 'General'] || categoryIcons['General'];
              const CatIcon = isSettlement ? ArrowRightLeft : cat.icon;
              const catGradient = isSettlement ? 'from-blue-50 to-blue-100 text-blue-600' : cat.gradient;

              return (
                <motion.div variants={itemVariants} key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className={clsx(
                      "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl shrink-0 mt-0.5 sm:mt-0 bg-gradient-to-br",
                      catGradient
                    )}>
                      <CatIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">{exp.description}</p>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        {payer?.displayName || 'Someone'} {isSettlement ? 'settled up' : 'paid'} · {exp.date?.toDate ? format(exp.date.toDate(), 'MMM d, yyyy') : 'Unknown date'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {exp.category && exp.category !== 'General' && (
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] sm:text-xs rounded-md font-medium">
                            {exp.category}
                          </span>
                        )}
                        {exp.notes && (
                          <p className="text-[10px] sm:text-xs text-slate-400 italic line-clamp-1">"{exp.notes}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right pl-13 sm:pl-0 shrink-0">
                    {myNet > 0 ? (
                      <div>
                        <span className="text-[10px] sm:text-xs text-slate-400 block mb-0.5 font-medium uppercase tracking-wide">you lent</span>
                        <span className="font-bold text-emerald-600 text-sm sm:text-base">{currencySymbol}{myNet.toFixed(2)}</span>
                      </div>
                    ) : myNet < 0 ? (
                      <div>
                        <span className="text-[10px] sm:text-xs text-slate-400 block mb-0.5 font-medium uppercase tracking-wide">you borrowed</span>
                        <span className="font-bold text-rose-600 text-sm sm:text-base">{currencySymbol}{Math.abs(myNet).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">not involved</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
