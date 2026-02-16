import { NextRequest, NextResponse } from 'next/server';
import pusherServer from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    if (!pusherServer) {
      return NextResponse.json(
        { error: 'Pusher not configured' },
        { status: 503 }
      );
    }

    // For presence channels, we need user info
    if (channelName.startsWith('presence-')) {
      // Get user info from the request headers or cookies
      const userInfoHeader = request.headers.get('x-user-info');
      let userData = { id: socketId, name: 'Anonymous' };

      if (userInfoHeader) {
        try {
          const parsed = JSON.parse(userInfoHeader);
          userData = {
            id: parsed.email || socketId,
            name: parsed.name || 'Anonymous',
          };
        } catch {
          // Use defaults
        }
      }

      const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
        user_id: userData.id,
        user_info: {
          name: userData.name,
        },
      });

      return NextResponse.json(authResponse);
    }

    // For private channels
    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
