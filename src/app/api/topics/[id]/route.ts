import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import User from '@/models/User';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
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

      // Find the user
      const user = await User.findOne({ email: userEmail.toLowerCase() });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Find topic
      const topic = await Topic.findById(id);

      if (!topic) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }

      // Check if user already voted on this topic (toggle vote)
      const userEmailLower = userEmail.toLowerCase();
      const hasVoted = topic.votedBy.includes(userEmailLower);

      if (hasVoted) {
        // Remove vote (toggle off) - always allowed
        topic.votes -= 1;
        topic.votedBy = topic.votedBy.filter(email => email !== userEmailLower);
        await topic.save();

        // Return vote to user
        user.votesRemaining += 1;
        await user.save();
      } else {
        // Add vote (toggle on) - only if votes remaining
        if (user.votesRemaining <= 0) {
          return NextResponse.json(
            { error: 'No votes remaining' },
            { status: 400 }
          );
        }

        topic.votes += 1;
        topic.votedBy.push(userEmailLower);
        await topic.save();

        // Decrement user's remaining votes
        user.votesRemaining -= 1;
        await user.save();
      }

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

      const topic = await Topic.findById(id);

      if (!topic) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }

      // If changing to 'discussed', return votes to users and set discussedAt
      if (status === 'discussed' && topic.status !== 'discussed') {
        // Return votes to all users who voted on this topic
        if (topic.votedBy && topic.votedBy.length > 0) {
          await User.updateMany(
            { email: { $in: topic.votedBy } },
            { $inc: { votesRemaining: 1 } }
          );
        }

        // Set discussedAt timestamp
        topic.discussedAt = new Date();
      }

      // Update status
      topic.status = status;
      
      // Update totalTimeDiscussed if provided
      if (body.totalTimeDiscussed !== undefined) {
        topic.totalTimeDiscussed = body.totalTimeDiscussed;
      }
      
      await topic.save();

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
  } catch (error) {
    console.error('Error in PUT /api/topics/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update topic', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
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
  } catch (error) {
    console.error('Error in DELETE /api/topics/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
