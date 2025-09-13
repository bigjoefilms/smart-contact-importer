import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utilis/firebase';
import { collection, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
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
      return NextResponse.json({ 
        error: 'Invalid request: contacts array is required' 
      }, { status: 400 });
    }
    
    console.log(`🚀 Starting to save ${contacts.length} contacts to database...`);
    console.log('Database path: company/default/contacts');
    console.log('Sample contact data:', contacts[0]);
    
    // Save contacts to Firebase
    const contactsRef = collection(db, 'company/default/contacts');
    const savedContacts = [];
    
    for (const contact of contacts) {
      try {
        // Create a new document reference to get auto-generated ID
        const contactRef = doc(contactsRef);
        
        // Map agent email to UID if agentEmail is provided
        let agentUid = contact.agentUid;
        if (contact.agentEmail && !agentUid) {
          agentUid = await mapAgentEmailToUid(contact.agentEmail);
          if (!agentUid) {
            console.warn(`No user found for agent email: ${contact.agentEmail}`);
          }
        }
        
        const contactData = {
          ...contact,
          agentUid: agentUid || contact.agentUid,
          createdOn: contact.createdOn ? new Date(contact.createdOn) : new Date(),
          id: contactRef.id
        };
        
        // Remove agentEmail from final data as it's not needed in the contact record
        delete contactData.agentEmail;
        
        console.log(`Saving contact:`, contactData);
        
        await setDoc(contactRef, contactData);
        
        savedContacts.push({
          id: contactRef.id,
          ...contactData
        });
        
        console.log(` Saved contact: ${contact.firstName} ${contact.lastName} with ID: ${contactRef.id}${agentUid ? ` (assigned to agent: ${agentUid})` : ''}`);
      } catch (contactError) {
        console.error(`Failed to save contact ${contact.firstName} ${contact.lastName}:`, contactError);
        console.error('Contact data that failed:', contact);
        // Continue with other contacts even if one fails
      }
    }
    
    console.log(`🎉 Successfully saved ${savedContacts.length} out of ${contacts.length} contacts`);
    
    return NextResponse.json({ 
      success: true,
      savedCount: savedContacts.length,
      totalCount: contacts.length,
      contacts: savedContacts
    });
    
  } catch (error) {
    console.error(' Error saving contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to save contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
