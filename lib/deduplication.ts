import { Contact } from './firebase-service';

export interface DeduplicationResult {
  contacts: Contact[];
  duplicates: Contact[];
  skipped: Contact[];
  summary: {
    total: number;
    created: number;
    merged: number;
    skipped: number;
  };
}

export function deduplicateContacts(
  newContacts: Contact[],
  existingContacts: Contact[]
): DeduplicationResult {
  const contacts: Contact[] = [];
  const duplicates: Contact[] = [];
  const skipped: Contact[] = [];
  
  const existingByEmail = new Map<string, Contact>();
  const existingByPhone = new Map<string, Contact>();
  
  // Index existing contacts by email and phone
  existingContacts.forEach(contact => {
    if (contact.email) {
      existingByEmail.set(contact.email.toLowerCase(), contact);
    }
    if (contact.phone) {
      existingByPhone.set(contact.phone.replace(/\D/g, ''), contact);
    }
  });

  newContacts.forEach(contact => {
    const email = contact.email?.toLowerCase();
    const phone = contact.phone?.replace(/\D/g, '');
    
    let existingContact: Contact | null = null;
    // let matchType = ''; // Removed unused variable
    
    // Check for email match first
    if (email && existingByEmail.has(email)) {
      existingContact = existingByEmail.get(email)!;
      // matchType = 'email'; // Removed unused assignment
    }
    // Check for phone match if no email match
    else if (phone && existingByPhone.has(phone)) {
      existingContact = existingByPhone.get(phone)!;
      // matchType = 'phone'; // Removed unused assignment
    }
    
    if (existingContact) {
      // Merge contacts (skip blank overwrites)
      const mergedContact = mergeContacts(existingContact, contact);
      duplicates.push(mergedContact);
    } else {
      // New contact
      contacts.push(contact);
    }
  });

  return {
    contacts,
    duplicates,
    skipped,
    summary: {
      total: newContacts.length,
      created: contacts.length,
      merged: duplicates.length,
      skipped: skipped.length
    }
  };
}

function mergeContacts(existing: Contact, newContact: Contact): Contact {
  const merged = { ...existing };
  
  // Merge fields, only updating if new value is not blank
  Object.keys(newContact).forEach(key => {
    if (key === 'createdOn' || key === 'updatedOn') return; // Skip timestamp fields
    
    const newValue = newContact[key];
    if (newValue && newValue.toString().trim() !== '') {
      merged[key] = newValue;
    }
  });
  
  // Update the updatedOn timestamp
  merged.updatedOn = new Date();
  
  return merged;
}

export function validateAgentEmails(
  contacts: Contact[],
  usersMap: Record<string, string>
): { valid: Contact[]; invalid: Contact[] } {
  const valid: Contact[] = [];
  const invalid: Contact[] = [];
  
  contacts.forEach(contact => {
    if (contact.agentUid) {
      // Check if agentUid exists in users map
      const agentExists = Object.values(usersMap).includes(contact.agentUid);
      if (agentExists) {
        valid.push(contact);
      } else {
        // Remove invalid agentUid
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { agentUid, ...contactWithoutAgent } = contact;
        invalid.push(contactWithoutAgent);
      }
    } else {
      valid.push(contact);
    }
  });
  
  return { valid, invalid };
}
