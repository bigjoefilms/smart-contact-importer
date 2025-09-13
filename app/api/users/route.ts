import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utilis/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
}

export async function GET() {
  try {
    // Fetch users from Firebase
    const usersRef = collection(db, 'company/default/users');
    const q = query(usersRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    const users: User[] = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
    
    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
