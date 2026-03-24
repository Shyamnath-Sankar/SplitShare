import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FolderPlus, Users, Check, X, Settings, UserPlus, UserMinus, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
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

  if (!currentUser) return null;

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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Groups</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-500">Organize expenses with multiple people.</p>
      </div>

      {/* Create Group */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100">
            <FolderPlus className="h-4 w-4 text-indigo-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Create a group</h2>
        </div>
        <form onSubmit={handleCreateGroup} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Group Name</label>
            <input
              type="text"
              placeholder="e.g. Apartment, Trip to Hawaii"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 px-4 sm:px-5 py-2.5 sm:py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-slate-50/50 placeholder:text-slate-400 disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Add Members</label>
            <select
              multiple
              value={selectedFriends}
              onChange={(e) => setSelectedFriends(Array.from(e.target.selectedOptions).map((option: any) => option.value))}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-[100px] sm:min-h-[120px] bg-slate-50/50 disabled:opacity-50"
            >
              {friendsIds.map(id => (
                <option key={id} value={id} className="p-2 rounded-md hover:bg-slate-100">{users[id]?.displayName || id}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2">Hold Ctrl/Cmd to select multiple friends.</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.97] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="h-5 w-5" />
                Create Group
              </>
            )}
          </button>
        </form>
        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</motion.p>}
        {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{success}</motion.p>}
      </div>

      {/* Group Invitations */}
      {pendingGroups.length > 0 && (
        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-emerald-100 overflow-hidden">
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-emerald-50/30 px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-900">Group Invitations</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">{pendingGroups.length}</span>
          </div>
          <ul className="divide-y divide-emerald-50">
            {pendingGroups.map((group) => {
              const creator = users[group.createdBy];
              return (
                <li key={group.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-slate-900">{group.name}</p>
                      <p className="text-xs sm:text-sm text-slate-500">Invited by {creator?.displayName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => acceptGroupInvite(group.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all active:scale-90" title="Accept">
                      <Check className="h-5 w-5" />
                    </button>
                    <button onClick={() => rejectGroupInvite(group.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all active:scale-90" title="Decline">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Active Groups */}
      <div className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/30 px-5 sm:px-8 py-4 sm:py-5">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">Your groups</h3>
        </div>
        {activeGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center">
            <div className="mb-4 sm:mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900">No groups yet</h3>
            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-sm">Create a group to easily split expenses for trips, apartments, or events.</p>
          </div>
        ) : (
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-50"
          >
            {activeGroups.map((group, index) => {
              const balance = getGroupBalance(group.id);
              const colorIdx = index % groupColors.length;
              return (
                <motion.li variants={itemVariants} key={group.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${groupColors[colorIdx]} ${groupIconColors[colorIdx]}`}>
                      <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-slate-900">{group.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {/* Member avatar stack */}
                        <div className="flex -space-x-1.5">
                          {group.members.slice(0, 4).map(mId => (
                            <div key={mId} className="h-5 w-5 rounded-full bg-slate-200 border border-white overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-500">
                              {users[mId]?.photoURL ? (
                                <img src={users[mId].photoURL} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                              ) : (
                                users[mId]?.displayName?.[0]?.toUpperCase()
                              )}
                            </div>
                          ))}
                          {group.members.length > 4 && (
                            <div className="h-5 w-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                              +{group.members.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{group.members.length} members</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      {balance > 0.01 ? (
                        <div className="text-sm">
                          <span className="text-slate-400 block mb-0.5 text-[10px] font-medium uppercase tracking-wide">you are owed</span>
                          <span className="font-bold text-emerald-600">{getCurrencySymbol(userProfile?.currency)}{balance.toFixed(2)}</span>
                        </div>
                      ) : balance < -0.01 ? (
                        <div className="text-sm">
                          <span className="text-slate-400 block mb-0.5 text-[10px] font-medium uppercase tracking-wide">you owe</span>
                          <span className="font-bold text-rose-600">{getCurrencySymbol(userProfile?.currency)}{Math.abs(balance).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Settled</span>
                      )}
                    </div>
                    {group.createdBy === currentUser.uid && (
                      <button
                        onClick={() => {
                          setManagingGroupId(group.id);
                          setInviteSelected([]);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all active:scale-90"
                        title="Manage Members"
                      >
                        <Settings className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>

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
                  <select
                    multiple
                    value={inviteSelected}
                    onChange={(e) => setInviteSelected(Array.from(e.target.selectedOptions).map((option: any) => option.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none min-h-[100px] bg-slate-50/50"
                  >
                    {friendsIds
                      .filter(id => !currentManagingGroup.members.includes(id) && !currentManagingGroup.pendingMembers?.includes(id))
                      .map(id => (
                        <option key={id} value={id} className="p-2 rounded-md hover:bg-slate-100">
                          {users[id]?.displayName || id}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-slate-400">Hold Ctrl/Cmd to select multiple friends.</p>
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
