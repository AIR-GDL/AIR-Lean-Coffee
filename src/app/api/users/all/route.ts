import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/users/all:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}
