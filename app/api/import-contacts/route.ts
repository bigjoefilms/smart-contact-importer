import { NextRequest, NextResponse } from 'next/server';
import { processRow, saveContacts, getUsersMap, ensureCustomFields, ensureCoreFields } from '@/lib/firebase-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parsedData, aiMapping } = body;
    
    if (!parsedData || !aiMapping) {
      return NextResponse.json({ error: 'Missing parsedData or aiMapping' }, { status: 400 });
    }

    // Ensure core fields exist in Firebase
    await ensureCoreFields();
    
    // Ensure custom fields exist
    await ensureCustomFields(aiMapping);
    
    // Get users map for agent email to UID conversion
    const usersMap = await getUsersMap();
    
    // Process each row and create contacts
    const contacts = [];
    for (const row of parsedData.rows) {
      try {
        const contact = await processRow(row, aiMapping, usersMap);
        contacts.push(contact);
      } catch (error) {
        console.error('Error processing row:', error);
        // Continue with other rows even if one fails
      }
    }
    
    // Save all contacts to Firebase
    await saveContacts(contacts);
    
    return NextResponse.json({ 
      success: true, 
      imported: contacts.length,
      message: `Successfully imported ${contacts.length} contacts` 
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: 'Failed to import contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
