import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all topics with status 'discussed', sorted by discussedAt descending
    const discussedTopics = await Topic.find({ status: 'discussed' })
      .sort({ discussedAt: -1 });
    
    return NextResponse.json(discussedTopics, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/topics/history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion history', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
