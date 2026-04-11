import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Login() {
  const { currentUser, login, loginError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await login();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white relative">
      {/* ─── Status Bar Overlay ─── */}
      <div className="lg:hidden fixed top-0 w-full h-[var(--mobile-top-padding)] bg-[#044d4b] z-[60]" />

      {/* Left/Top Branding Pane */}
      <div className="relative flex-1 lg:w-1/2 bg-[#044d4b] flex flex-col justify-end overflow-hidden pt-[var(--mobile-top-padding)] pb-12 lg:pb-0">
        <div className="absolute inset-0 bg-[#044d4b]/40 mix-blend-multiply z-10" />
        {/* Use a CSS gradient instead of an external image that may fail to load */}
        <div
          className="absolute inset-0 opacity-50 mix-blend-overlay"
          style={{
            background: 'linear-gradient(135deg, #065a58 0%, #033f3d 30%, #022b29 60%, #044d4b 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#044d4b] via-[#044d4b]/60 to-transparent z-20" />

        <div className="relative z-30 p-8 lg:p-16 text-white pb-16 lg:pb-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-6 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 p-2 lg:p-3 overflow-hidden">
              <img src="/screen1.png" alt="SplitShare Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="mb-4 text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Share Expenses.<br />Save Friendships.
            </h1>

          </motion.div>
        </div>
      </div>

      {/* Right/Bottom Login Pane */}
      <div className="flex w-full shrink-0 flex-col justify-center bg-white px-8 py-10 lg:w-1/2 lg:px-16 xl:px-24 rounded-t-[2.5rem] lg:rounded-none -mt-10 lg:mt-0 relative z-40">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-sm pt-4 lg:pt-0"
        >
          <div className="mb-8 lg:mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-[#1a2d2a] mb-2">Welcome</h2>
            <p className="text-[#6e8581]">Sign in to your account to continue.</p>
          </div>

          {/* Error message display */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium"
            >
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                Sign-in failed. Please try again.
              </p>
            </motion.div>
          )}

          <button
            onClick={handleLogin}
            disabled={isSigningIn}
            className="group relative flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-[#044d4b] px-4 py-4 text-white transition-all hover:bg-[#033f3d] hover:shadow-lg hover:shadow-[#044d4b]/20 active:scale-[0.98] font-bold text-[13px] tracking-wide uppercase disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
              {isSigningIn ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#044d4b] border-t-transparent" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              )}
            </div>
            {isSigningIn ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="mt-8 text-center text-xs text-[#6e8581] font-medium leading-relaxed">
            By continuing, you agree to our Terms of Service<br className="hidden sm:block" /> and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
