import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Expense, Group, User } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface DataContextType {
  expenses: Expense[];
  groups: Group[];
  users: Record<string, User>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  editExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  createGroup: (name: string, memberIds: string[]) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
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
  }, [groups, expenses, currentUser]);

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

  const editExpense = async (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    try {
      await updateDoc(doc(db, 'expenses', id), expense);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `expenses/${id}`);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
      throw error;
    }
  };

  const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as User;
    } catch (error) {
      console.error(error);
      return null;
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
      expenses, groups, users, 
      addExpense, editExpense, deleteExpense, getUserByEmail,
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
