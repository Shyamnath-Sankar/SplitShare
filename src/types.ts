export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  currency?: string;
  language?: string;
}

export interface Friendship {
  id: string;
  users: string[];
  status: 'pending' | 'accepted';
  createdAt: any;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  pendingMembers?: string[];
  createdBy: string;
  createdAt: any;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: any;
  creatorId: string;
  payerId: string;
  groupId?: string;
  participants: string[];
  splits: Record<string, { paid: number; owed: number }>;
  createdAt: any;
  type: 'expense' | 'settlement';
  category?: string;
  paymentMethod?: string;
  notes?: string;
  receiptUrl?: string;
}
