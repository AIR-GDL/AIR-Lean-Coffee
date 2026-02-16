import { NextRequest, NextResponse } from 'next/server';
import pusher from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Missing event or data' },
        { status: 400 }
      );
    }

    // Trigger event to all connected clients
    await pusher.trigger('bugs', event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher bug event error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger bug event' },
      { status: 500 }
    );
  }
}
