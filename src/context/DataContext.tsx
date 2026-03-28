import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Expense, Friendship, Group, User } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface DataContextType {
  expenses: Expense[];
  friendships: Friendship[];
  groups: Group[];
  users: Record<string, User>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  addFriend: (email: string) => Promise<void>;
  acceptFriend: (friendshipId: string) => Promise<void>;
  rejectFriend: (friendshipId: string) => Promise<void>;
  createGroup: (name: string, memberIds: string[]) => Promise<void>;
  acceptGroupInvite: (groupId: string) => Promise<void>;
  rejectGroupInvite: (groupId: string) => Promise<void>;
  removeGroupMember: (groupId: string, memberId: string) => Promise<void>;
  inviteToGroup: (groupId: string, memberIds: string[]) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setFriendships([]);
      setGroups([]);
      setUsers({});
      return;
    }

    const uid = currentUser.uid;

    // Listen to expenses
    const qExpenses = query(collection(db, 'expenses'), where('participants', 'array-contains', uid));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const exps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      exps.sort((a, b) => b.date?.toMillis() - a.date?.toMillis());
      setExpenses(exps);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'expenses'));

    // Listen to friendships
    const qFriendships = query(collection(db, 'friendships'), where('users', 'array-contains', uid));
    const unsubFriendships = onSnapshot(qFriendships, (snapshot) => {
      setFriendships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'friendships'));

    // Listen to groups (where user is a member or pending member)
    const qGroups = query(collection(db, 'groups'), where('members', 'array-contains', uid));
    const qPendingGroups = query(collection(db, 'groups'), where('pendingMembers', 'array-contains', uid));
    
    const unsubGroups = onSnapshot(qGroups, (snapshot) => {
      setGroups(prev => {
        const newGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        // Merge with pending groups to avoid duplicates if any
        const pending = prev.filter(g => g.pendingMembers?.includes(uid));
        const merged = [...newGroups, ...pending.filter(p => !newGroups.find(n => n.id === p.id))];
        return merged;
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'groups'));

    const unsubPendingGroups = onSnapshot(qPendingGroups, (snapshot) => {
      setGroups(prev => {
        const newPendingGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        const memberGroups = prev.filter(g => g.members.includes(uid));
        const merged = [...memberGroups, ...newPendingGroups.filter(p => !memberGroups.find(m => m.id === p.id))];
        return merged;
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'groups'));

    return () => {
      unsubExpenses();
      unsubFriendships();
      unsubGroups();
      unsubPendingGroups();
    };
  }, [currentUser]);

  // Fetch users involved in friendships, groups, expenses
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUsers = async () => {
      const userIds = new Set<string>();
      userIds.add(currentUser.uid);
      
      friendships.forEach(f => f.users.forEach(u => userIds.add(u)));
      groups.forEach(g => {
        g.members.forEach(u => userIds.add(u));
        g.pendingMembers?.forEach(u => userIds.add(u));
      });
      expenses.forEach(e => e.participants.forEach(u => userIds.add(u)));

      const newUsers = { ...users };
      let updated = false;

      for (const uid of userIds) {
        if (!newUsers[uid]) {
          try {
            // We can't query by ID easily without multiple getDocs, but we can just listen or fetch
            // For simplicity, we fetch them individually if missing.
            const q = query(collection(db, 'users'), where('uid', '==', uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
              newUsers[uid] = snap.docs[0].data() as User;
              updated = true;
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
          }
        }
      }

      if (updated) {
        setUsers(newUsers);
      }
    };

    fetchUsers();
  }, [friendships, groups, expenses, currentUser]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...expense,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
      throw error;
    }
  };

  const addFriend = async (email: string) => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error('User not found with that email.');
      }
      const friendId = snap.docs[0].data().uid;
      
      if (friendId === currentUser.uid) {
        throw new Error('You cannot add yourself as a friend.');
      }

      // Check if friendship already exists
      const existing = friendships.find(f => f.users.includes(friendId));
      if (existing) {
        throw new Error('Friendship already exists.');
      }

      await addDoc(collection(db, 'friendships'), {
        users: [currentUser.uid, friendId],
        status: 'pending', // Require acceptance
        createdAt: serverTimestamp(),
      });
    } catch (error: any) {
      if (['User not found with that email.', 'You cannot add yourself as a friend.', 'Friendship already exists.'].includes(error?.message)) {
        throw error;
      }
      handleFirestoreError(error, OperationType.CREATE, 'friendships');
      throw error;
    }
  };

  const acceptFriend = async (friendshipId: string) => {
    try {
      await updateDoc(doc(db, 'friendships', friendshipId), {
        status: 'accepted'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `friendships/${friendshipId}`);
      throw error;
    }
  };

  const rejectFriend = async (friendshipId: string) => {
    try {
      await deleteDoc(doc(db, 'friendships', friendshipId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendships/${friendshipId}`);
      throw error;
    }
  };

  const createGroup = async (name: string, memberIds: string[]) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'groups'), {
        name,
        members: [currentUser.uid],
        pendingMembers: [...new Set(memberIds.filter(id => id !== currentUser.uid))],
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'groups');
      throw error;
    }
  };

  const acceptGroupInvite = async (groupId: string) => {
    if (!currentUser) return;
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      
      const newPending = (group.pendingMembers || []).filter(id => id !== currentUser.uid);
      const newMembers = [...new Set([...group.members, currentUser.uid])];
      
      await updateDoc(doc(db, 'groups', groupId), {
        members: newMembers,
        pendingMembers: newPending
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}`);
      throw error;
    }
  };

  const rejectGroupInvite = async (groupId: string) => {
    if (!currentUser) return;
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      
      const newPending = (group.pendingMembers || []).filter(id => id !== currentUser.uid);
      
      await updateDoc(doc(db, 'groups', groupId), {
        pendingMembers: newPending
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}`);
      throw error;
    }
  };

  const removeGroupMember = async (groupId: string, memberId: string) => {
    if (!currentUser) return;
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      
      const newMembers = group.members.filter(id => id !== memberId);
      const newPending = (group.pendingMembers || []).filter(id => id !== memberId);
      
      await updateDoc(doc(db, 'groups', groupId), {
        members: newMembers,
        pendingMembers: newPending
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}`);
      throw error;
    }
  };

  const inviteToGroup = async (groupId: string, memberIds: string[]) => {
    if (!currentUser) return;
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      
      const currentPending = group.pendingMembers || [];
      const newPending = [...new Set([...currentPending, ...memberIds])];
      
      await updateDoc(doc(db, 'groups', groupId), {
        pendingMembers: newPending
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}`);
      throw error;
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'groups', groupId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `groups/${groupId}`);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{ 
      expenses, friendships, groups, users, 
      addExpense, addFriend, acceptFriend, rejectFriend, 
      createGroup, acceptGroupInvite, rejectGroupInvite,
      removeGroupMember, inviteToGroup, deleteGroup
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
