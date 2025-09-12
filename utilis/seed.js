import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
// import { getAuth, signInAnonymously } from 'firebase/auth'; // Removed unused imports

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBdyLQVUtfGw-FMFmxEBorK0T104LPb8ko",
  authDomain: "smart-contact-importer.firebaseapp.com",
  projectId: "smart-contact-importer",
  storageBucket: "smart-contact-importer.firebasestorage.app",
  messagingSenderId: "619688176983",
  appId: "1:619688176983:web:8d918159005af35868e212",
  measurementId: "G-1Q2KVS4703"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COMPANY_ID = 'default';

// Core contact fields (cannot be deleted)
const coreContactFields = [
  { id: 'firstName', label: 'First Name', type: 'text', core: true },
  { id: 'lastName', label: 'Last Name', type: 'text', core: true },
  { id: 'phone', label: 'Phone', type: 'phone', core: true },
  { id: 'email', label: 'Email', type: 'email', core: true },
  { id: 'agentUid', label: 'Assigned Agent', type: 'text', core: true },
];

// Custom contact fields (can be edited/deleted)
const customContactFields = [
  { id: 'company', label: 'Company', type: 'text', core: false },
  { id: 'jobTitle', label: 'Job Title', type: 'text', core: false },
  { id: 'dealValue', label: 'Deal Value', type: 'number', core: false },
  { id: 'lastContactDate', label: 'Last Contact Date', type: 'datetime', core: false },
  { id: 'notes', label: 'Notes', type: 'text', core: false },
];

// Sample users
const users = [
  { uid: 'user1', name: 'John Agent', email: 'john@company.com' },
  { uid: 'user2', name: 'Jane Smith', email: 'jane@company.com' },
  { uid: 'user3', name: 'Mike Wilson', email: 'mike@company.com' },
  { uid: 'user4', name: 'Sarah Johnson', email: 'sarah@company.com' },
  { uid: 'user5', name: 'David Brown', email: 'david@company.com' },
];

// Sample contacts with custom fields
const contacts = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    phone: '+1-555-0101',
    email: 'alice.johnson@techcorp.com',
    agentUid: 'user1',
    createdOn: new Date('2024-01-15'),
    // Custom fields
    company: 'Tech Corp',
    jobTitle: 'CEO',
    dealValue: 50000,
    notes: 'Very interested in enterprise solution'
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    phone: '+1-555-0102',
    email: 'bob.smith@salesinc.com',
    agentUid: 'user2',
    createdOn: new Date('2024-01-20'),
    // Custom fields
    company: 'Sales Inc',
    jobTitle: 'Sales Manager',
    dealValue: 25000,
    notes: 'Needs demo next week'
  },
  {
    firstName: 'Carol',
    lastName: 'Davis',
    phone: '+1-555-0103',
    email: 'carol.davis@marketingplus.org',
    agentUid: 'user1',
    createdOn: new Date('2024-02-01'),
    // Custom fields
    company: 'Marketing Plus',
    jobTitle: 'Marketing Director',
    dealValue: 35000,
    notes: 'Looking for Q2 implementation'
  },
  {
    firstName: 'Daniel',
    lastName: 'Wilson',
    phone: '+1-555-0104',
    email: 'daniel.wilson@startup.io',
    agentUid: 'user3',
    createdOn: new Date('2024-02-05'),
    // Custom fields
    company: 'Startup IO',
    jobTitle: 'CTO',
    dealValue: 15000,
    notes: 'Budget constraints, considering basic plan'
  },
  {
    firstName: 'Emma',
    lastName: 'Thompson',
    phone: '+1-555-0105',
    email: 'emma.thompson@enterprise.com',
    agentUid: 'user2',
    createdOn: new Date('2024-02-10'),
    // Custom fields
    company: 'Enterprise Corp',
    jobTitle: 'VP of Operations',
    dealValue: 75000,
    notes: 'Ready to sign, waiting for final approval'
  }
];

async function seed() {
  try {
    console.log('🚀 Starting seeding process...');

    // 1. Seed contact fields (core + custom)
    console.log('\n📋 Seeding contact fields...');
    const allFields = [...coreContactFields, ...customContactFields];
    
    for (const field of allFields) {
      await setDoc(doc(db, 'company', COMPANY_ID, 'contactFields', field.id), field);
      console.log(`✅ Added ${field.core ? 'core' : 'custom'} field: ${field.label} (${field.type})`);
    }
    console.log(`Total contact fields: ${allFields.length}`);

    // 2. Seed users
    console.log('\n👥 Seeding users...');
    for (const user of users) {
      await setDoc(doc(db, 'company', COMPANY_ID, 'users', user.uid), user);
      console.log(`✅ Added user: ${user.name} (${user.email})`);
    }
    console.log(`Total users: ${users.length}`);

    // 3. Seed contacts
    console.log('\n📞 Seeding contacts...');
    for (const contact of contacts) {
      // Create a new document reference to get auto-generated ID
      const contactRef = doc(collection(db, 'company', COMPANY_ID, 'contacts'));
      await setDoc(contactRef, contact);
      console.log(`✅ Added contact: ${contact.firstName} ${contact.lastName} (assigned to ${contact.agentUid})`);
    }
    console.log(`Total contacts: ${contacts.length}`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Core fields: ${coreContactFields.length}`);
    console.log(`- Custom fields: ${customContactFields.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Contacts: ${contacts.length}`);
    console.log('\n🔍 Check your Firebase Console to view the data');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();