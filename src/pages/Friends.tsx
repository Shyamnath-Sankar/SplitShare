import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Check, X, UserMinus, AlertTriangle, Mail, Loader2, Search, Eye, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';

export default function Friends() {
  const { friendships, users, expenses, addFriend, acceptFriend, rejectFriend } = useData();
  const { currentUser, userProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<{id: string, name: string} | null>(null);

  if (!currentUser) return null;

  const currencySymbol = getCurrencySymbol(userProfile?.currency);

  // Calculate balances per user
  const balances: Record<string, number> = {};
  expenses.forEach(exp => {
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

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addFriend(email);
      setSuccess('Friend request sent successfully!');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = friendships.filter(f => f.status === 'pending' && f.users[1] === currentUser.uid);
  const sentRequests = friendships.filter(f => f.status === 'pending' && f.users[0] === currentUser.uid);
  const acceptedFriends = friendships.filter(f => f.status === 'accepted');

  const friendsList = acceptedFriends.map(f => {
    const friendId = f.users.find(u => u !== currentUser.uid);
    const friendUser = friendId ? users[friendId] : null;
    return friendUser ? { user: friendUser, friendshipId: f.id } : null;
  }).filter(Boolean) as { user: any, friendshipId: string }[];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const filteredFriends = friendsList.filter(f => 
    f.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-lg mx-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#6e8581]" />
        </div>
        <input
          type="text"
          placeholder="Search friends or groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full bg-[#eaeeee] py-3.5 pl-12 pr-4 text-sm font-medium text-[#1a2d2a] placeholder:text-[#6e8581] focus:outline-none focus:ring-2 focus:ring-[#044d4b]/20 transition-all border-none"
        />
      </div>

      <div className="flex items-end justify-between px-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#044d4b]">Friends</h1>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#798a83] mb-1">Network List</span>
      </div>

      {/* Add Friend Manually */}
      <div className="bg-[#f5f7f6] rounded-3xl p-5 border border-slate-100 mt-2">
        <h2 className="text-sm font-bold text-[#1a2d2a] mb-3">Add a connection manually</h2>
        <form onSubmit={handleAddFriend} className="flex gap-2">
          <input
            type="email"
            placeholder="Friend's email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044d4b]/20"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#044d4b] px-4 py-3 text-white transition-all hover:bg-[#033f3d] disabled:opacity-70 flex items-center justify-center w-12"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-rose-600 font-medium">{error}</p>}
        {success && <p className="mt-2 text-xs text-emerald-600 font-medium">{success}</p>}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-3xl bg-[#f5f7f6] p-4 border border-slate-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-[#1a2d2a] mb-3 ml-2">Pending Requests ({pendingRequests.length})</h3>
          <ul className="space-y-2 ml-2">
            {pendingRequests.map((req) => {
              const senderId = req.users[0];
              const sender = users[senderId];
              if (!sender) return null;
              
              return (
                <li key={req.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d0d6d3] text-[#486360] font-bold">
                      {sender.displayName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a2d2a]">{sender.displayName}</p>
                      <p className="text-xs text-[#6e8581]">{sender.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => acceptFriend(req.id)} className="p-2 bg-[#044d4b] text-white rounded-xl hover:bg-[#033f3d] transition-colors"><Check className="h-4 w-4" /></button>
                    <button onClick={() => rejectFriend(req.id)} className="p-2 bg-[#eaeeee] text-[#6e8581] rounded-xl hover:bg-[#d0d6d3] transition-colors"><X className="h-4 w-4" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Friends List */}
      <div>
        {filteredFriends.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaeeee] mx-auto">
              <Users className="h-6 w-6 text-[#798a83]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a2d2a]">No friends found</h3>
            <p className="mt-2 text-sm text-[#6e8581]">Try adjusting your search or add a new friend.</p>
          </div>
        ) : (
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredFriends.map(({ user: friend, friendshipId }) => {
              const bal = balances[friend.uid] || 0;
              const initials = friend.displayName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?';
              
              return (
                <motion.li variants={itemVariants} key={friend.uid} className="flex items-center justify-between p-4 rounded-3xl bg-[#f5f7f6] transition-colors">
                  <div className="flex items-start gap-4">
                    {friend.photoURL ? (
                      <img src={friend.photoURL} alt="" className="h-12 w-12 rounded-full object-cover shadow-sm mt-0.5" referrerPolicy="no-referrer" />
                    ) : ( 
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#044d4b] text-white font-bold tracking-wider text-sm mt-0.5">
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col justify-center min-h-[48px]">
                      <p className="text-base font-semibold text-[#1a2d2a] leading-tight mb-1">{friend.displayName}</p>
                      <p className="text-[11px] text-[#6e8581] leading-tight mb-2">{friend.email}</p>
                      
                      {bal > 0.01 && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded-full bg-[#fde8e8] text-[#c81e1e] text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                          Owes you {currencySymbol}{bal.toFixed(2)}
                        </span>
                      )}
                      {bal < -0.01 && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded-full bg-[#def7ec] text-[#03543f] text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                          You owe {currencySymbol}{Math.abs(bal).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[#044d4b]">
                    <button onClick={() => setFriendToRemove({ id: friendshipId, name: friend.displayName })} className="hover:opacity-70 transition-opacity">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>



      {/* Remove Friend Modal */}
      {friendToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Remove Friend</h3>
            </div>
            <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Are you sure you want to remove <strong>{friendToRemove.name}</strong> from your friends list? This will not delete your shared expenses.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setFriendToRemove(null)}
                className="px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await rejectFriend(friendToRemove.id);
                  setFriendToRemove(null);
                }}
                className="px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all active:scale-[0.97]"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
