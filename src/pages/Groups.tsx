import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FolderPlus, Users, Check, X, Settings, UserPlus, UserMinus, AlertTriangle, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrencySymbol } from '../utils/currency';

export default function Groups() {
  const { groups, friendships, users, createGroup, acceptGroupInvite, rejectGroupInvite, expenses, removeGroupMember, inviteToGroup, deleteGroup } = useData();
  const { currentUser, userProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managingGroupId, setManagingGroupId] = useState<string | null>(null);
  const [inviteSelected, setInviteSelected] = useState<string[]>([]);
  const [groupToDelete, setGroupToDelete] = useState<{id: string, name: string} | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (!currentUser) return null;

  const currencySymbol = getCurrencySymbol(userProfile?.currency);

  const friendsIds = friendships
    .filter(f => f.status === 'accepted')
    .map(f => f.users.find(u => u !== currentUser.uid))
    .filter(Boolean) as string[];

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createGroup(name, selectedFriends);
      setSuccess('Group created successfully!');
      setName('');
      setSelectedFriends([]);
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
        <div className="rounded-3xl bg-[#f5f7f6] p-4 border border-slate-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-[#1a2d2a] mb-3 ml-2">Invitations ({pendingGroups.length})</h3>
          <ul className="space-y-2 ml-2">
            {pendingGroups.map((group) => {
              const creator = users[group.createdBy];
              return (
                <li key={group.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d0d6d3] text-[#486360]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a2d2a]">{group.name}</p>
                      <p className="text-xs text-[#6e8581]">Invited by {creator?.displayName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => acceptGroupInvite(group.id)} className="p-2 bg-[#044d4b] text-white rounded-xl hover:bg-[#033f3d] transition-colors"><Check className="h-4 w-4" /></button>
                    <button onClick={() => rejectGroupInvite(group.id)} className="p-2 bg-[#eaeeee] text-[#6e8581] rounded-xl hover:bg-[#d0d6d3] transition-colors"><X className="h-4 w-4" /></button>
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
            <div className="bg-[#f5f7f6] rounded-3xl p-5 border border-slate-100">
              <div className="flex justify-between items-center mb-4 mt-2 px-1">
                <h2 className="text-sm font-bold text-[#1a2d2a]">Create a Group</h2>
                <button onClick={() => setIsCreating(false)} className="text-[#6e8581]"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Group Name (e.g. Hawaii Trip)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-white px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044d4b]/20"
                    required
                  />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {friendsIds.map(id => {
                    const isSelected = selectedFriends.includes(id);
                    return (
                      <div 
                        key={id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFriends(selectedFriends.filter(fId => fId !== id));
                          } else {
                            setSelectedFriends([...selectedFriends, id]);
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-[#044d4b] bg-emerald-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                      >
                         <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-[#044d4b] bg-[#044d4b]' : 'border-slate-300'}`}>
                           {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                         </div>
                         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 overflow-hidden shrink-0">
                           {users[id]?.photoURL ? <img src={users[id].photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : users[id]?.displayName?.[0]?.toUpperCase()}
                         </div>
                         <span className="text-sm font-medium text-slate-700">{users[id]?.displayName || id}</span>
                      </div>
                    );
                  })}
                  {friendsIds.length === 0 && <p className="text-xs text-slate-400 p-2">You don't have any friends to add yet.</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#044d4b] px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition-all hover:bg-[#033f3d] disabled:opacity-70 flex items-center justify-center gap-2"
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
          <div className="py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaeeee] mx-auto">
              <Users className="h-6 w-6 text-[#798a83]" />
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
                <motion.li variants={itemVariants} key={group.id} className="flex flex-col p-4 rounded-3xl bg-[#f5f7f6] transition-colors relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#044d4b] text-white font-bold text-lg shrink-0">
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
                        <button
                          onClick={() => {
                            setManagingGroupId(group.id);
                            setInviteSelected([]);
                          }}
                          className="p-2 text-[#6e8581] hover:text-[#044d4b] transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
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
      <motion.div variants={itemVariants} className="rounded-3xl bg-[#044d4b] p-6 lg:p-8 text-white relative overflow-hidden mt-6 shadow-sm">
        <h3 className="text-lg lg:text-xl font-bold mb-3 z-10 relative">Start a new group</h3>
        <p className="text-sm text-[#85dbcd] mb-6 max-w-[80%] leading-relaxed z-10 relative">
          Create shared ledgers for trips, housemates, or events instantly.
        </p>
        <button 
          onClick={() => {
            setIsCreating(!isCreating);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative z-10 flex justify-center items-center rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#044d4b] transition-all hover:bg-slate-50 active:scale-[0.98]"
        >
          Create Now
        </button>
        <FolderPlus className="absolute right-[-10%] bottom-[-20%] h-36 w-36 text-[#155b59] pointer-events-none" />
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
              {/* Invite Friends */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Invite Friends</h4>
                <div className="flex flex-col gap-2">
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {friendsIds
                      .filter(id => !currentManagingGroup.members.includes(id) && !currentManagingGroup.pendingMembers?.includes(id))
                      .map(id => {
                        const isSelected = inviteSelected.includes(id);
                        return (
                          <div 
                            key={id}
                            onClick={() => {
                              if (isSelected) {
                                setInviteSelected(inviteSelected.filter(fId => fId !== id));
                              } else {
                                setInviteSelected([...inviteSelected, id]);
                              }
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                          >
                             <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                               {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                             </div>
                             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 overflow-hidden shrink-0">
                               {users[id]?.photoURL ? <img src={users[id].photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : users[id]?.displayName?.[0]?.toUpperCase()}
                             </div>
                             <span className="text-sm font-medium text-slate-700">{users[id]?.displayName || id}</span>
                          </div>
                        );
                      })}
                    {friendsIds.filter(id => !currentManagingGroup.members.includes(id) && !currentManagingGroup.pendingMembers?.includes(id)).length === 0 && (
                      <p className="text-xs text-slate-400 p-2 text-center bg-slate-50 rounded-xl">All your friends are already in this group.</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (inviteSelected.length > 0) {
                      await inviteToGroup(currentManagingGroup.id, inviteSelected);
                      setInviteSelected([]);
                    }
                  }}
                  disabled={inviteSelected.length === 0}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-40"
                >
                  <UserPlus className="h-4 w-4" />
                  Send Invites
                </button>
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
