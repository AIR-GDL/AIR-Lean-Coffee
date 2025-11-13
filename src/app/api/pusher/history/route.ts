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
    await pusher.trigger('history', event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher history event error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger history event' },
      { status: 500 }
    );
  }
}
