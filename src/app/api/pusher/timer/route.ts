import { NextRequest, NextResponse } from 'next/server';
import pusher from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { event, data, channel } = await request.json();

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Missing event or data' },
        { status: 400 }
      );
    }

    // Trigger event to all connected clients on timer channel
    await pusher.trigger(channel || 'timer', event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher timer event error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger timer event' },
      { status: 500 }
    );
  }
}
