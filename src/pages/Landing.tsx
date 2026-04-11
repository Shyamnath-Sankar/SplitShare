import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Users, Zap, Smartphone, Globe, ArrowRight, ShieldCheck, CheckCircle2, UserPlus, PieChart, Tag, Activity, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleCTA = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#044d4b]/20">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 pt-[var(--mobile-top-padding)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#044d4b] shadow-sm overflow-hidden p-[2px]">
              <img src="/screen1.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Split<span className="text-[#044d4b]">Share</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!currentUser ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-xl bg-[#044d4b] text-white text-sm font-semibold hover:bg-[#033f3d] transition-all hover:shadow-lg hover:shadow-[#044d4b]/20 active:scale-95"
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-[#044d4b] text-white text-sm font-semibold hover:bg-[#033f3d] transition-all hover:shadow-lg hover:shadow-[#044d4b]/20 active:scale-95 flex items-center gap-2"
              >
                Go to App <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-slate-50 to-slate-50"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div
              className="flex-1 text-center lg:text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-[#044d4b] text-sm font-semibold mb-6 ring-1 ring-emerald-200">
                <SparklesIcon className="w-4 h-4" />
                <span>The smartest way to split bills</span>
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Share Expenses.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#044d4b] to-emerald-600">
                  Save Friendships.
                </span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family. Seamlessly syncs across all your devices.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleCTA}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#044d4b] text-white text-base font-semibold hover:bg-[#033f3d] transition-all hover:shadow-xl hover:shadow-[#044d4b]/20 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  {currentUser ? 'Open Dashboard' : 'Start for free'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex-1 w-full max-w-lg lg:max-w-none relative"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.2 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200/50 bg-white">
                <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-white to-slate-50 h-[400px] flex flex-col gap-4">
                  {/* Mock UI Elements */}
                  <div className="h-12 w-3/4 bg-slate-100 rounded-xl animate-pulse"></div>
                  <div className="flex gap-4">
                    <div className="h-32 flex-1 bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                      <div className="h-4 w-1/2 bg-emerald-200 rounded mb-2"></div>
                      <div className="h-8 w-3/4 bg-emerald-300 rounded"></div>
                    </div>
                    <div className="h-32 flex-1 bg-rose-50 rounded-2xl border border-rose-100 p-4">
                      <div className="h-4 w-1/2 bg-rose-200 rounded mb-2"></div>
                      <div className="h-8 w-3/4 bg-rose-300 rounded"></div>
                    </div>
                  </div>
                  <div className="h-16 w-full bg-slate-100 rounded-xl mt-auto"></div>
                </div>
                {/* Floating element */}
                <motion.div
                  className="absolute -right-6 -bottom-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">You are settled up!</div>
                    <div className="text-xs text-slate-500">All balances are clear.</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Logo Cloud ─── */}
      <section className="py-10 border-y border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by roommates and friends worldwide</p>
          <div className="flex justify-center gap-8 md:gap-16 grayscale opacity-40">
            <Zap className="h-8 w-8" />
            <Globe className="h-8 w-8" />
            <ShieldCheck className="h-8 w-8" />
            <Smartphone className="h-8 w-8" />
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-24 lg:py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">Everything you need to manage shared expenses</h2>
            <p className="text-lg text-slate-600">No more spreadsheets, no more awkward conversations. SplitShare does the math for you.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#044d4b]" />}
              title="Group Expenses"
              desc="Create groups for apartments, trips, or events and add expenses as you go. Perfect for shared living or travel."
            />
            <FeatureCard
              icon={<UserPlus className="w-6 h-6 text-[#044d4b]" />}
              title="Friend Balances"
              desc="Track individual balances with friends. Always know who owes who at a glance without any awkwardness."
            />
            <FeatureCard
              icon={<PieChart className="w-6 h-6 text-[#044d4b]" />}
              title="Rich Analytics"
              desc="Visualize your spending patterns with interactive charts. Understand where your money goes across different groups."
            />
            <FeatureCard
              icon={<Tag className="w-6 h-6 text-[#044d4b]" />}
              title="Expense Categories"
              desc="Organize your spending by categorizing expenses like Food, Transport, Housing, and Utilities."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[#044d4b]" />}
              title="Smart Settlement"
              desc="Record payments and settle debts with a single tap. We calculate the most efficient way to pay everyone back."
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-[#044d4b]" />}
              title="Activity Timeline"
              desc="Stay in loop with a detailed history of all transactions, settlements, and changes made by your friends."
            />
          </div>
        </div>
      </section>

      {/* ─── How it Works Section ─── */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-8">How SplitShare works</h2>
              <div className="space-y-12">
                <Step
                  number="01"
                  title="Create a Group"
                  desc="Whether it's for a trip to Bali or monthly rent, start by creating a group and inviting your friends."
                />
                <Step
                  number="02"
                  title="Add Expenses"
                  desc="Snap a photo of the receipt or enter the amount manually. Tag who paid and how it should be split."
                />
                <Step
                  number="03"
                  title="Settle Up"
                  desc="See exactly who owes what. When someone pays you back, record it with a tap. Easy as that."
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square bg-gradient-to-br from-[#044d4b] to-emerald-900 rounded-[4rem] relative flex items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20"></div>
                <motion.div
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl"
                  animate={{ rotateY: [0, 10, 0], rotateX: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">02</div>
                    <div className="font-bold text-xl">Adding Dinner Bill</div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-white/20 rounded"></div>
                    <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                    <div className="h-10 w-full bg-emerald-500 rounded-xl mt-4 flex items-center justify-center font-bold">Split Equally</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Cross-Platform Section (Refined) ─── */}
      <section className="py-24 lg:py-32 bg-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#044d4b]/5 blur-[120px] rounded-full point-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-display">Seamless Web & Android Support</h2>
            <p className="text-lg text-slate-600 italic">One account. All your devices. Zero friction.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Web Dashboard</h3>
                </div>
                <p className="text-slate-600 mb-6">Optimized for desktop productivity. Manage large groups, export detailed CSV reports, and get deep insights into your spending patterns.</p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant browser access
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Advanced data export
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time sync
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No installation needed
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Native Android App</h3>
                </div>
                <p className="text-slate-600 mb-6">Optimized for the on-the-go lifestyle. Get push notifications for new expenses and use the camera to scan receipts offline.</p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Native performance
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Push notifications
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Offline support
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Biometric security
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative justify-self-center lg:justify-self-end">
              {/* Mockup Container */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#044d4b]/20 to-blue-500/10 rounded-[3rem] blur-2xl group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center">
                  {/* Web View Mockup Overlay */}
                  <motion.div
                    className="absolute -left-20 top-10 w-[400px] h-[250px] bg-white rounded-2xl shadow-2xl border border-slate-200 hidden xl:block z-0"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="h-6 bg-slate-100 border-b border-slate-200 rounded-t-2xl flex items-center px-4 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center px-2">
                        <div className="h-4 w-24 bg-slate-100 rounded"></div>
                        <div className="h-4 w-12 bg-slate-100 rounded"></div>
                      </div>
                      <div className="h-24 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                        <PieChart className="w-8 h-8 text-slate-300" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Phone View Mockup */}
                  <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3.5rem] p-3 shadow-[0_0_80px_rgba(4,77,75,0.2)] border-8 border-slate-800 z-10 scale-90 lg:scale-100">
                    <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20">
                      <div className="w-36 h-7 bg-slate-900 rounded-b-3xl"></div>
                    </div>
                    <div className="w-full h-full bg-slate-50 rounded-[2.8rem] overflow-hidden flex flex-col pt-12 px-5 relative">
                      <div className="flex justify-between items-center mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center"><Users className="w-5 h-5 text-slate-400" /></div>
                        <div className="font-extrabold text-[#044d4b] tracking-tight">SplitShare</div>
                        <div className="w-10 h-10 rounded-2xl bg-[#044d4b] flex items-center justify-center shadow-lg"><Plus className="w-5 h-5 text-white" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">You owe</div>
                            <div className="text-lg font-bold text-rose-500">$42.50</div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold">JD</div>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">You are owed</div>
                            <div className="text-lg font-bold text-emerald-500">$128.00</div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold">MK</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-6">
            <FAQItem
              question="Is SplitShare really free?"
              answer="Yes! Our core features like group management, bill splitting, and balance tracking are 100% free for everyone."
            />
            <FAQItem
              question="Does everyone need to have an account?"
              answer="To accurately track balances and receive notifications, yes. But you can always add expenses on behalf of others as 'offline friends'."
            />
            <FAQItem
              question="Can I use it offline?"
              answer="Absolutely. Our Android app supports offline mode, allowing you to add expenses which will sync automatically once you're back online."
            />
          </div>
        </div>
      </section>

      {/* ─── Footer CTA ─── */}
      <section className="py-24 bg-[#044d4b] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">Ready to eliminate money stress?</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of people who use SplitShare to manage their shared expenses and keep their friendships intact.</p>
          <button
            onClick={handleCTA}
            className="px-8 py-4 rounded-2xl bg-white text-[#044d4b] text-base font-bold hover:bg-slate-50 transition-all hover:shadow-2xl active:scale-95 shadow-xl shadow-black/10"
          >
            Create your free account
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center overflow-hidden p-[1px]">
              <img src="/screen1.png" alt="Logo" className="h-full w-full object-contain grayscale opacity-70" />
            </div>
            <span className="font-bold text-white tracking-tight">SplitShare</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} SplitShare. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/termsandcondition')} className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="text-4xl font-black text-white/10 group-hover:text-emerald-500/30 transition-colors duration-500 tabular-nums leading-none pt-1">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">{title}</h3>
        <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left font-bold text-slate-900"
      >
        {question}
        <Plus className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
      <div className={`px-8 transition-all duration-300 ease-in-out ${isOpen ? 'pb-6 opacity-100 max-h-40' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Sparkles icon workaround if not in lucide-react (it is, but just in case)
function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}
