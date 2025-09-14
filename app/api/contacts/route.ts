import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utilis/firebase';
import { collection, getDocs, query, orderBy, limit, doc, setDoc,updateDoc } from 'firebase/firestore';
import { mapAgentEmailToUid } from '@/lib/firebase-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '50');
    
    // Fetch contacts from Firebase
    const contactsRef = collection(db, 'company/default/contacts');
    const q = query(contactsRef, orderBy('createdOn', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    const contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ contacts });
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contacts } = body;

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid request: contacts array is required' }, { status: 400 });
    }

    console.log(`🚀 Starting to save ${contacts.length} contacts to database...`);
    console.log('Database path: company/default/contacts');
    console.log('Sample contact data:', contacts[0]);

    const contactsRef = collection(db, 'company/default/contacts');
    const savedContacts = [];
    let createdCount = 0;
    let mergedCount = 0;

    // Fetch all existing contacts once
    console.log('📚 Fetching all existing contacts...');
    const allContactsSnapshot = await getDocs(contactsRef);
    const emailToContact = new Map();
    const phoneToContact = new Map();

    allContactsSnapshot.forEach(doc => {
      const contactData = { id: doc.id, ...doc.data() } as Record<string, unknown>;
      if (contactData.email) {
        emailToContact.set(contactData.email, contactData);
      }
      if (contactData.phone) {
        phoneToContact.set(contactData.phone, contactData);
      }
    });

    console.log(`📊 Found ${allContactsSnapshot.size} existing contacts in database`);

    for (const contact of contacts) {
      try {
        // Map agent email to UID if agentEmail is provided
        let agentUid = contact.agentUid;
        if (contact.agentEmail && !agentUid) {
          agentUid = await mapAgentEmailToUid(contact.agentEmail);
          if (!agentUid) {
            console.warn(`No user found for agent email: ${contact.agentEmail}`);
          }
        }

        // Check for existing contact using maps
        let existingContact = null;
        
        if (contact.email && emailToContact.has(contact.email)) {
          existingContact = emailToContact.get(contact.email);
        } else if (contact.phone && phoneToContact.has(contact.phone)) {
          existingContact = phoneToContact.get(contact.phone);
        }

        const contactData = {
          ...contact,
          agentUid: agentUid || contact.agentUid,
          createdOn: contact.createdOn ? new Date(contact.createdOn) : new Date(),
        };

        // Remove agentEmail from final data
        delete contactData.agentEmail;

        if (existingContact) {
          // Merge data - don't overwrite existing values with empty/null values
          const mergedData = { ...existingContact };
          const changes: string[] = [];
          
          Object.keys(contactData).forEach(key => {
            if (contactData[key] && (!existingContact[key] || existingContact[key] === '')) {
              mergedData[key] = contactData[key];
              changes.push(`${key}: '${existingContact[key] || 'empty'}' → '${contactData[key]}'`);
            }
          });

          // Update existing contact
          const existingDocRef = doc(contactsRef, existingContact.id);
          await updateDoc(existingDocRef, mergedData);
          
          // Update the maps for future lookups
          if (mergedData.email) emailToContact.set(mergedData.email, mergedData);
          if (mergedData.phone) phoneToContact.set(mergedData.phone, mergedData);
          
          savedContacts.push(mergedData);
          mergedCount++;
          
          console.log(`📝 Merged contact: ${contact.firstName} ${contact.lastName} with ID: ${existingContact.id}`);
          if (changes.length > 0) {
            console.log(`   Changes: ${changes.join(', ')}`);
          }
        } else {
          // Create new contact
          const contactRef = doc(contactsRef);
          contactData.id = contactRef.id;
          
          await setDoc(contactRef, contactData);
          
          // Update the maps for future lookups in this batch
          if (contactData.email) emailToContact.set(contactData.email, contactData);
          if (contactData.phone) phoneToContact.set(contactData.phone, contactData);
          
          savedContacts.push({ id: contactRef.id, ...contactData });
          createdCount++;
          
          console.log(`✨ Created contact: ${contact.firstName} ${contact.lastName} with ID: ${contactRef.id}${agentUid ? ` (assigned to agent: ${agentUid})` : ''}`);
        }

      } catch (contactError) {
        console.error(`Failed to process contact ${contact.firstName} ${contact.lastName}:`, contactError);
        console.error('Contact data that failed:', contact);
      }
    }

    console.log(`🎉 Successfully processed ${savedContacts.length} out of ${contacts.length} contacts`);
    console.log(`📊 Created: ${createdCount}, Merged: ${mergedCount}`);

    return NextResponse.json({
      success: true,
      totalProcessed: savedContacts.length,
      totalCount: contacts.length,
      created: createdCount,
      merged: mergedCount,
      contacts: savedContacts
    });

  } catch (error) {
    console.error('❌ Error saving contacts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save contacts', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

// Test function to verify database connection
export async function PUT() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Try to save a test contact
    const testContact = {
      firstName: 'Test',
      lastName: 'Contact',
      phone: '+1-555-0000',
      email: 'test@example.com',
      agentUid: 'test-agent',
      createdOn: new Date(),
      company: 'Test Company',
      notes: 'This is a test contact to verify database connection'
    };
    
    const contactsRef = collection(db, 'company/default/contacts');
    const contactRef = doc(contactsRef);
    await setDoc(contactRef, testContact);
    
    console.log('✅ Test contact saved successfully!');
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connection test successful',
      testContactId: contactRef.id
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      error: 'Database connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
