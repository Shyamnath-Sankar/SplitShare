import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Check, X, UserMinus, AlertTriangle, Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Friends() {
  const { friendships, users, addFriend, acceptFriend, rejectFriend } = useData();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<{id: string, name: string} | null>(null);

  if (!currentUser) return null;

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Friends</h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500">Manage your connections.</p>
        </div>
        {acceptedFriends.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
            {acceptedFriends.length} friend{acceptedFriends.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Add Friend */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
            <Mail className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Add a friend</h2>
        </div>
        <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="email"
            placeholder="Friend's email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 sm:px-5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-slate-50/50 placeholder:text-slate-400 disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 sm:px-6 sm:py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.97] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Send Request
              </>
            )}
          </button>
        </form>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            {success}
          </motion.p>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-emerald-100 overflow-hidden">
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-emerald-50/30 px-5 py-4 sm:px-8 sm:py-5 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-900">Pending Requests</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">{pendingRequests.length}</span>
          </div>
          <ul className="divide-y divide-emerald-50">
            {pendingRequests.map((req) => {
              const senderId = req.users[0];
              const sender = users[senderId];
              if (!sender) return null;
              
              return (
                <li key={req.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {sender.photoURL ? (
                      <img src={sender.photoURL} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-200 object-cover ring-2 ring-white" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 font-bold text-base sm:text-lg">
                        {sender.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-slate-900">{sender.displayName}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{sender.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => acceptFriend(req.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all active:scale-90"
                      title="Accept"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => rejectFriend(req.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all active:scale-90"
                      title="Decline"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-8 sm:py-5 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Sent Requests</h3>
            <span className="text-xs font-medium text-slate-500">{sentRequests.length} pending</span>
          </div>
          <ul className="divide-y divide-slate-50">
            {sentRequests.map((req) => {
              const receiverId = req.users[1];
              const receiver = users[receiverId];
              if (!receiver) return null;
              
              return (
                <li key={req.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4 opacity-70">
                    {receiver.photoURL ? (
                      <img src={receiver.photoURL} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-200 object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold text-base sm:text-lg">
                        {receiver.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-slate-900">{receiver.displayName}</p>
                      <p className="text-xs sm:text-sm text-amber-600 font-medium">Pending acceptance...</p>
                    </div>
                  </div>
                  <button
                    onClick={() => rejectFriend(req.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-90"
                    title="Cancel Request"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Friends List */}
      <div className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/30 px-5 py-4 sm:px-8 sm:py-5">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">Your friends</h3>
        </div>
        {friendsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center">
            <div className="mb-4 sm:mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <User className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900">No friends yet</h3>
            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-sm">Add friends by their email address to start sharing expenses.</p>
          </div>
        ) : (
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-50"
          >
            {friendsList.map(({ user: friend, friendshipId }) => (
              <motion.li variants={itemVariants} key={friend.uid} className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  {friend.photoURL ? (
                    <img src={friend.photoURL} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-200 object-cover ring-2 ring-white shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 font-bold text-base sm:text-lg ring-2 ring-white shadow-sm">
                      {friend.displayName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-slate-900">{friend.displayName}</p>
                    <p className="text-xs sm:text-sm text-slate-400">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFriendToRemove({ id: friendshipId, name: friend.displayName })}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                  title="Remove Friend"
                >
                  <UserMinus className="h-5 w-5" />
                </button>
              </motion.li>
            ))}
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
