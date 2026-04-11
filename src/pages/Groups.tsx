import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FolderPlus, Users, Check, X, Settings, UserPlus, UserMinus, AlertTriangle, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';

export default function Groups() {
  const { groups, users, createGroup, acceptGroupInvite, rejectGroupInvite, expenses, removeGroupMember, inviteToGroup, deleteGroup, getUserByEmail } = useData();
  const { currentUser, userProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managingGroupId, setManagingGroupId] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<{id: string, name: string} | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [createEmail, setCreateEmail] = useState('');
  const [createAddedUsers, setCreateAddedUsers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');

  if (!currentUser) return null;

  const currencySymbol = getCurrencySymbol(userProfile?.currency);



  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createGroup(name, createAddedUsers.map(u => u.uid));
      setSuccess('Group created successfully!');
      setName('');
      setCreateAddedUsers([]);
      setCreateEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const getGroupBalance = (groupId: string) => {
    let net = 0;
    expenses.filter(e => e.groupId === groupId).forEach(exp => {
      const mySplit = exp.splits[currentUser.uid];
      if (mySplit) {
        net += (mySplit.paid - mySplit.owed);
      }
    });
    return net;
  };

  const pendingGroups = groups.filter(g => g.pendingMembers?.includes(currentUser.uid));
  const activeGroups = groups.filter(g => g.members.includes(currentUser.uid));
  const currentManagingGroup = groups.find(g => g.id === managingGroupId);

  const groupColors = ['from-indigo-50 to-indigo-100', 'from-violet-50 to-violet-100', 'from-sky-50 to-sky-100', 'from-amber-50 to-amber-100', 'from-rose-50 to-rose-100'];
  const groupIconColors = ['text-indigo-600', 'text-violet-600', 'text-sky-600', 'text-amber-600', 'text-rose-600'];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-lg mx-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#044d4b]">Groups</h1>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#798a83] mb-1">Network List</span>
      </div>

      {/* Group Invitations */}
      {pendingGroups.length > 0 && (
        <div className="glass-strong rounded-3xl p-4 mb-6 relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          <h3 className="text-sm font-bold text-[#1a2d2a] mb-3 ml-2">Invitations ({pendingGroups.length})</h3>
          <ul className="space-y-2 ml-2">
            {pendingGroups.map((group) => {
              const creator = users[group.createdBy];
              return (
                <li key={group.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm border border-slate-200">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a2d2a]">{group.name}</p>
                      <p className="text-xs text-[#6e8581]">Invited by {creator?.displayName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => acceptGroupInvite(group.id)} className="p-2 gradient-brand text-white rounded-xl shadow-md shadow-[var(--color-brand)]/20 active-bounce"><Check className="h-4 w-4" /></button>
                    <button onClick={() => rejectGroupInvite(group.id)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors shadow-sm active-bounce"><X className="h-4 w-4" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Create Group Form (Inline) */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-strong rounded-3xl p-5 shadow-lg border border-white/50">
              <div className="flex justify-between items-center mb-4 mt-2 px-1">
                <h2 className="text-sm font-bold text-[#1a2d2a]">Create a Group</h2>
                <button onClick={() => setIsCreating(false)} className="text-[#6e8581] active-bounce"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Group Name (e.g. Hawaii Trip)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-white px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent border border-slate-200 transition-all"
                    required
                  />
                </div>
                <div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="email"
                      placeholder="Add member by email..."
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1 rounded-2xl bg-white px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] border border-slate-200 transition-all"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting || !createEmail}
                      onClick={async () => {
                        setIsSubmitting(true);
                        setError('');
                        const u = await getUserByEmail(createEmail.trim().toLowerCase());
                        if (u) {
                           if (u.uid === currentUser.uid) {
                             setError("You're automatically in the group.");
                           } else if (createAddedUsers.find(x => x.uid === u.uid)) {
                             setError("User already added.");
                           } else {
                             setCreateAddedUsers([...createAddedUsers, u]);
                             setCreateEmail('');
                           }
                        } else {
                           setError("User not found.");
                        }
                        setIsSubmitting(false);
                      }}
                      className="rounded-2xl bg-emerald-100 text-emerald-700 px-5 py-3 font-semibold hover:bg-emerald-200 transition-colors disabled:opacity-50 active-bounce"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {createAddedUsers.map(u => (
                      <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                         <div className="flex items-center gap-3">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 overflow-hidden shrink-0">
                             {u.photoURL ? <img src={u.photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : u.displayName?.[0]?.toUpperCase()}
                           </div>
                           <span className="text-sm font-medium text-slate-700">{u.displayName}</span>
                         </div>
                         <button type="button" onClick={() => setCreateAddedUsers(prev => prev.filter(x => x.uid !== u.uid))} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl gradient-brand px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-[var(--shadow-glow-brand)] transition-all hover:shadow-lg active-bounce disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                  Create Group
                </button>
              </form>
              {error && <p className="mt-3 text-xs text-rose-600 font-medium px-1">{error}</p>}
              {success && <p className="mt-3 text-xs text-emerald-600 font-medium px-1">{success}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Groups List */}
      <div className="mb-4">
        {activeGroups.length === 0 ? (
          <div className="py-12 text-center glass rounded-3xl mt-4">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mx-auto border border-slate-200">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a2d2a]">No active groups</h3>
            <p className="mt-2 text-sm text-[#6e8581]">Create one to easily split expenses.</p>
          </div>
        ) : (
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {activeGroups.map((group, index) => {
              const balance = getGroupBalance(group.id);
              return (
                <motion.li variants={itemVariants} key={group.id} className="flex flex-col p-4 rounded-3xl glass card-hover relative group cursor-pointer" onClick={() => setManagingGroupId(group.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] gradient-brand text-white font-bold text-lg shadow-[var(--shadow-glow-brand)] shrink-0">
                        {group.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#1a2d2a] mb-0.5">{group.name}</p>
                        <p className="text-xs text-[#6e8581]">{group.members.length} members • {balance === 0 ? 'Settled up' : 'Active'}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        {balance > 0.01 ? (
                          <span className="font-bold text-[#076c65] text-base">+{currencySymbol}{balance.toFixed(2)}</span>
                        ) : balance < -0.01 ? (
                          <span className="font-bold text-[#b53f3f] text-base">-{currencySymbol}{Math.abs(balance).toFixed(2)}</span>
                        ) : (
                          <span className="text-xs font-bold text-[#6e8581] uppercase tracking-widest">Even</span>
                        )}
                      </div>
                      {group.createdBy === currentUser.uid && (
                        <div className="p-2 text-slate-300 group-hover:text-[var(--color-brand)] transition-colors">
                          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>

      {/* Start New Group Banner */}
      <motion.div variants={itemVariants} className="rounded-3xl gradient-brand p-6 lg:p-8 text-white relative overflow-hidden mt-6 shadow-[var(--shadow-glow-brand)] card-hover">
        <h3 className="text-lg lg:text-xl font-bold mb-3 z-10 relative">Start a new group</h3>
        <p className="text-sm text-emerald-100 mb-6 max-w-[80%] leading-relaxed z-10 relative">
          Create shared ledgers for trips, housemates, or events instantly.
        </p>
        <button 
          onClick={() => {
            setIsCreating(!isCreating);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative z-10 flex justify-center items-center rounded-xl bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand-dark)] transition-all hover:bg-slate-50 active-bounce shadow-lg"
        >
          Create Now
        </button>
        <div className="absolute right-[-10%] bottom-[-20%] pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
          <FolderPlus className="h-48 w-48 text-white" />
        </div>
      </motion.div>

      {/* Manage Group Modal */}
      {currentManagingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 truncate pr-4">Manage "{currentManagingGroup.name}"</h3>
              <button onClick={() => setManagingGroupId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full shrink-0 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 space-y-6">
              {/* Invite via Email */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Invite via Email</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Friend's email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      onClick={async () => {
                        if (!inviteEmail) return;
                        setIsSubmitting(true);
                        const u = await getUserByEmail(inviteEmail.trim().toLowerCase());
                        if (u) {
                          if (currentManagingGroup.members.includes(u.uid) || currentManagingGroup.pendingMembers?.includes(u.uid)) {
                            alert("User is already in the group or invited.");
                          } else {
                            await inviteToGroup(currentManagingGroup.id, [u.uid]);
                            setInviteEmail('');
                            alert("User invited!");
                          }
                        } else {
                          alert("User not found with that email.");
                        }
                        setIsSubmitting(false);
                      }}
                      disabled={isSubmitting || !inviteEmail}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-40"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Members */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Members</h4>
                <ul className="space-y-2">
                  {currentManagingGroup.members.map(mId => (
                    <li key={mId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden shrink-0">
                          {users[mId]?.photoURL ? <img src={users[mId].photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : users[mId]?.displayName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {users[mId]?.displayName} {mId === currentUser.uid && <span className="text-slate-400 font-normal">(You)</span>}
                        </span>
                      </div>
                      {mId !== currentUser.uid && (
                        <button
                          onClick={() => removeGroupMember(currentManagingGroup.id, mId)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90 shrink-0"
                          title="Remove Member"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                  {currentManagingGroup.pendingMembers?.map(mId => (
                    <li key={mId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden shrink-0">
                          {users[mId]?.photoURL ? <img src={users[mId].photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : users[mId]?.displayName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {users[mId]?.displayName} <span className="text-amber-500 font-normal">(Pending)</span>
                        </span>
                      </div>
                      <button
                        onClick={() => removeGroupMember(currentManagingGroup.id, mId)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90 shrink-0"
                        title="Cancel Invite"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delete Group */}
              <div className="pt-6 border-t border-slate-100 mt-6">
                <button
                  onClick={() => {
                    setGroupToDelete({ id: currentManagingGroup.id, name: currentManagingGroup.name });
                    setManagingGroupId(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-600 px-4 py-3 text-sm font-semibold hover:bg-rose-100 transition-colors"
                >
                  Delete Group
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Group Confirm Modal */}
      {groupToDelete && (
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
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Delete Group</h3>
            </div>
            <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Are you sure you want to delete <strong>{groupToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setGroupToDelete(null)}
                className="px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteGroup(groupToDelete.id);
                  setGroupToDelete(null);
                }}
                className="px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all active:scale-[0.97]"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
