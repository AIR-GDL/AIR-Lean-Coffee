import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import pusherServer, { CHANNELS, EVENTS } from '@/lib/pusher-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await pusherServer?.trigger(CHANNELS.LEAN_COFFEE, EVENTS.USER_DELETED, {
      userId: id,
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
