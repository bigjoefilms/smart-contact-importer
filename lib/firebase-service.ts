// Firebase service configuration and field definitions
import { db } from '../utilis/firebase';

export interface Contact {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  agentUid?: string;
  agentEmail?: string; // Temporary field for mapping
  createdOn?: Date;
  updatedOn?: Date;
  [key: string]: string | Date | undefined;
}

// Core contact fields that cannot be deleted (based on Firebase structure)
export const CORE_FIELDS = [
  'firstName',
  'lastName', 
  'phone',
  'email',
  'agentUid',
  'createdOn'
];

// Custom contact fields that can be edited/deleted
export const CUSTOM_FIELDS = [
  'company',
  'jobTitle',
  'dealValue',
  'notes'
];

// All available fields
export const ALL_FIELDS = [...CORE_FIELDS, ...CUSTOM_FIELDS];

// Field type definitions
export const FIELD_TYPES = {
  firstName: 'text',
  lastName: 'text',
  phone: 'phone',
  email: 'email',
  agentUid: 'text',
  createdOn: 'datetime',
  company: 'text',
  jobTitle: 'text',
  dealValue: 'number',
  notes: 'text'
};

// Field labels for display
export const FIELD_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  phone: 'Phone',
  email: 'Email',
  agentUid: 'Assigned Agent',
  agentEmail: 'Agent Email',
  createdOn: 'Created Date',
  company: 'Company',
  jobTitle: 'Job Title',
  dealValue: 'Deal Value',
  notes: 'Notes'
};

// User interface
export interface User {
  uid: string;
  name: string;
  email: string;
}

// Function to map agent email to UID
export async function mapAgentEmailToUid(agentEmail: string): Promise<string | null> {
  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const usersRef = collection(db, 'company/default/users');
    const q = query(usersRef, where('email', '==', agentEmail));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return userDoc.id;
    }
    
    return null; // User not found
  } catch (error) {
    console.error('Error mapping agent email to UID:', error);
    return null;
  }
}

// Function to get all users for mapping
export async function getAllUsers(): Promise<User[]> {
  try {
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const usersRef = collection(db, 'company/default/users');
    const q = query(usersRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export { db };
