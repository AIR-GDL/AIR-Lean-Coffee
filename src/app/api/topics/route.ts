import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import pusherServer, { CHANNELS, EVENTS } from '@/lib/pusher-server';

export async function GET() {
  try {
    await connectDB();
    
    const topics = await Topic.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { title, description, author } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const topic = await Topic.create({
      title,
      description: description || '',
      author,
      votes: 0,
      status: 'to-discuss',
    });

    await pusherServer?.trigger(CHANNELS.LEAN_COFFEE, EVENTS.TOPIC_CREATED, {
      topic,
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/topics:', error);
    return NextResponse.json(
      { error: 'Failed to create topic', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
