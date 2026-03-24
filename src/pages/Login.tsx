import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { currentUser, login } = useAuth();

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Pane - Image & Branding */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply z-10" />
        <img
          src="https://picsum.photos/seed/friends/1920/1080"
          alt="Friends sharing a moment"
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent z-20" />

        <div className="absolute bottom-0 left-0 z-30 p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="h-8 w-8 text-emerald-300" />
            </div>
            <h1 className="mb-4 text-6xl font-bold leading-tight tracking-tight">
              Share expenses.<br />Keep friendships.
            </h1>
            <p className="max-w-md text-lg text-emerald-100/90">
              The easiest way to track shared expenses, balances, and who owes who. Perfect for trips, housemates, and nights out.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 sm:px-16 xl:px-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="mb-10 lg:hidden">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">SplitShare</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your account to continue.</p>
          </div>

          <button
            onClick={login}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] font-medium"
          >
            <div className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            </div>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
