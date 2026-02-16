import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Strip legacy isAdmin field from all documents that still have it
    await User.updateMany({ isAdmin: { $exists: true } }, { $unset: { isAdmin: '' } });
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/users/all:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
