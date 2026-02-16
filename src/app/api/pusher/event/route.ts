import { NextRequest, NextResponse } from 'next/server';
import pusherServer, { CHANNELS, EVENTS } from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, data } = body;

    if (!eventName || !data) {
      return NextResponse.json(
        { error: 'eventName and data are required' },
        { status: 400 }
      );
    }

    const validEvents = Object.values(EVENTS);
    if (!validEvents.includes(eventName)) {
      return NextResponse.json(
        { error: 'Invalid event name' },
        { status: 400 }
      );
    }

    await pusherServer?.trigger(CHANNELS.LEAN_COFFEE, eventName, data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/pusher/event:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
