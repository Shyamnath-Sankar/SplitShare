import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Clock, Users, Folder, LogOut, Plus, Sparkles, Settings, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import AddExpenseModal from './AddExpenseModal';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { userProfile, logout } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/recent', icon: Clock, label: 'Activity' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/groups', icon: Folder, label: 'Groups' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const mobileNavLinks = navLinks.filter(link => link.to !== '/settings');

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 font-sans">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="w-72 flex-col border-r border-slate-200/40 hidden md:flex bg-white/60 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-20 items-center px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#044d4b] shadow-sm overflow-hidden p-1">
              <img src="/screen1.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Split<span className="text-[#044d4b]">Share</span></h1>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="mb-5 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Menu</div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) => clsx(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative',
                isActive 
                  ? 'bg-[#044d4b] text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              {({ isActive }) => (
                <>
                  <link.icon className={clsx("h-[18px] w-[18px] transition-colors", isActive ? "text-white" : "group-hover:text-slate-800")} />
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="p-4">
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="" className="h-10 w-10 rounded-full bg-slate-100 object-cover ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-white" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-white">
                  {userProfile?.displayName?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{userProfile?.displayName}</p>
                <p className="text-xs text-slate-400 truncate">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-[0.97]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/40 h-[calc(4rem+env(safe-area-inset-top))] sm:h-[calc(5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-4 sm:px-10">
          <div className="md:hidden flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#044d4b] shadow-sm border border-[#044d4b] overflow-hidden p-[2px]">
              <img src="/screen1.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-[#044d4b]">SplitShare</h1>
          </div>
          <div className="hidden md:block flex-1" />
          <div className="flex items-center gap-2 sm:gap-3">
            <NavLink
              to="/settings"
              className={({ isActive }) => clsx(
                'md:hidden flex h-10 w-10 items-center justify-center rounded-full transition-all',
                isActive ? 'bg-[#044d4b] text-white' : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80'
              )}
            >
              <Settings className="h-5 w-5" />
            </NavLink>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="group flex items-center gap-2 rounded-xl bg-[#044d4b] px-4 py-2.5 sm:px-5 sm:py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-[0.96]"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-10 sm:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="mx-auto max-w-5xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white backdrop-blur-xl border-t border-slate-100 flex justify-around pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 z-30">
        {mobileNavLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) => clsx(
              'relative flex flex-col items-center py-2 px-4 rounded-3xl text-[10px] font-semibold uppercase tracking-wider transition-colors min-w-[64px]',
              isActive ? 'bg-[#044d4b] text-white shadow-sm' : 'text-slate-400 bg-transparent'
            )}
          >
            {({ isActive }) => (
              <>
                <link.icon className={clsx(
                  "h-5 w-5 mb-1 transition-all duration-200",
                  isActive ? "text-white" : ""
                )} />
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {isAddModalOpen && (
        <AddExpenseModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}
