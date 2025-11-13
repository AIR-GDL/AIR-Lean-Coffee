import { NextRequest, NextResponse } from 'next/server';
import pusher from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { socket_id, channel_name } = body;

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Get user from session
    const userStr = request.headers.get('x-user') || '{}';
    let user;
    try {
      user = JSON.parse(userStr);
    } catch {
      user = {};
    }

    // Authenticate the channel
    const auth = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: user._id || 'anonymous',
      user_info: {
        name: user.name || 'Anonymous',
        email: user.email || '',
      },
    });

    return NextResponse.json(auth);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
