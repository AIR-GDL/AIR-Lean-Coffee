import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import User from '@/models/User';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();

    // Check if this is a vote action
    if (body.action === 'VOTE') {
      const { userEmail } = body;

      if (!userEmail) {
        return NextResponse.json(
          { error: 'User email is required for voting' },
          { status: 400 }
        );
      }

      // Find the user and check if they have votes remaining
      const user = await User.findOne({ email: userEmail.toLowerCase() });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (user.votesRemaining <= 0) {
        return NextResponse.json(
          { error: 'No votes remaining' },
          { status: 400 }
        );
      }

      // Increment topic votes
      const topic = await Topic.findByIdAndUpdate(
        id,
        { $inc: { votes: 1 } },
        { new: true }
      );

      if (!topic) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }

      // Decrement user's remaining votes
      user.votesRemaining -= 1;
      await user.save();

      return NextResponse.json({ topic, user }, { status: 200 });
    }

    // Check if this is a status change
    if (body.status) {
      const { status } = body;

      if (!['to-discuss', 'discussing', 'discussed'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }

      const topic = await Topic.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!topic) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(topic, { status: 200 });
    }

    // General update
    const topic = await Topic.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(topic, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/topics/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update topic', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Topic deleted successfully', topic },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/topics/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic', details: error.message },
      { status: 500 }
    );
  }
}
