import { NextRequest, NextResponse } from 'next/server';
import pusher from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, channel } = body;

    if (!event || !data || !channel) {
      return NextResponse.json(
        { error: 'Missing event, data, or channel' },
        { status: 400 }
      );
    }

    // Trigger event on Pusher
    await pusher.trigger(channel, event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher user event error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}
