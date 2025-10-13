import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - check if name needs to be updated
      if (user.name !== name) {
        user.name = name;
        await user.save();
      }
      return NextResponse.json(user, { status: 200 });
    }

    // Create new user
    user = await User.create({
      name,
      email: email.toLowerCase(),
      votesRemaining: 3,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: 'Failed to create/find user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
