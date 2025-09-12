// Firebase service configuration and field definitions
import { db } from '../utilis/firebase';

export interface Contact {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  agentUid?: string;
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
  'lastContactDate',
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
  lastContactDate: 'datetime',
  notes: 'text'
};

// Field labels for display
export const FIELD_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  phone: 'Phone',
  email: 'Email',
  agentUid: 'Assigned Agent',
  createdOn: 'Created Date',
  company: 'Company',
  jobTitle: 'Job Title',
  dealValue: 'Deal Value',
  lastContactDate: 'Last Contact Date',
  notes: 'Notes'
};

export { db };
