import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, User, Globe, DollarSign, Save, CheckCircle2 } from 'lucide-react';
import { currencies } from '../utils/currency';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ja', name: '日本語' },
];

export default function Settings() {
  const { userProfile, updateUserProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [upiId, setUpiId] = useState(userProfile?.upiId || '');
  const [currency, setCurrency] = useState(userProfile?.currency || 'USD');
  const [language, setLanguage] = useState(userProfile?.language || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await updateUserProfile({
        displayName,
        upiId,
        currency,
        language,
      });
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings', error);
      setSaveMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6 sm:space-y-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
          <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm sm:text-base text-slate-500">Manage your account preferences.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-8">
        <div className="flex items-center gap-5 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200/60">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="" className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-emerald-500/10 ring-offset-2 ring-offset-white shadow-lg" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl ring-4 ring-emerald-500/10 ring-offset-2 ring-offset-white shadow-lg">
              {userProfile?.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{userProfile?.displayName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{userProfile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
          {/* Profile Section */}
          <section>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-50 to-emerald-100">
                <User className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              Profile Settings
            </h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5 sm:mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-sm focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 outline-none transition-all bg-white placeholder:text-slate-400"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 sm:p-3 text-sm text-slate-400 cursor-not-allowed"
                />
                <p className="mt-1 text-[10px] sm:text-xs text-slate-400">Email cannot be changed.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5 sm:mb-2">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-sm focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 outline-none transition-all bg-white placeholder:text-slate-400"
                  placeholder="e.g. yourname@ybl"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Preferences Section */}
          <section>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-50 to-blue-100">
                <Globe className="h-3.5 w-3.5 text-blue-600" />
              </div>
              Preferences
            </h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5 sm:mb-2 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-sm focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 outline-none transition-all bg-white"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5 sm:mb-2 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-sm focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 outline-none transition-all bg-white"
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 text-sm font-medium ${saveMessage.includes('Failed') ? 'text-rose-600' : 'text-emerald-600'}`}
              >
                {!saveMessage.includes('Failed') && <CheckCircle2 className="h-4 w-4" />}
                {saveMessage}
              </motion.div>
            )}
            {!saveMessage && <div />}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-white transition-all shadow-[var(--shadow-glow-brand)] hover:shadow-lg active-bounce disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-[0.97] border border-slate-200 hover:border-rose-200 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign out
          </button>
        </div>
      </div>
    </motion.div>
  );
}
