import { useEffect, useRef } from 'react';
import { usePusher } from '@/context/PusherContext';
import type { User } from '@/types';

interface UserJoinedPayload {
  user: User;
  requestSync?: boolean;
}

interface UsePusherUsersProps {
  roomId?: string; // Room ID to scope the channel
  onUserJoined?: (payload: UserJoinedPayload) => void;
  onUserLeft?: (userId: string) => void;
  onUserUpdated?: (user: User) => void;
  onVotesUpdated?: (userId: string, votesRemaining: number) => void;
  onUserOnline?: (user: User) => void;
  onVoteCast?: (data: { userId: string; vote: string; voteCount: { against: number; neutral: number; favor: number } }) => void;
}

export function usePusherUsers({
  roomId = 'global', // Default to global for backward compatibility
  onUserJoined,
  onUserLeft,
  onUserUpdated,
  onVotesUpdated,
  onUserOnline,
  onVoteCast,
}: UsePusherUsersProps) {
  const { subscribe, unsubscribe } = usePusher();
  const callbacksRef = useRef({ onUserJoined, onUserLeft, onUserUpdated, onVotesUpdated, onUserOnline, onVoteCast });

  // Update callbacks ref without triggering effect
  useEffect(() => {
    callbacksRef.current = { onUserJoined, onUserLeft, onUserUpdated, onVotesUpdated, onUserOnline, onVoteCast };
  }, [onUserJoined, onUserLeft, onUserUpdated, onVotesUpdated, onUserOnline, onVoteCast]);

  useEffect(() => {
    // Use room-specific channel
    const channelName = `users-${roomId}`;
    const channel = subscribe(channelName);
    if (!channel) return;

    if (callbacksRef.current.onUserJoined) {
      channel.bind('user-joined', (data: UserJoinedPayload) => {
        callbacksRef.current.onUserJoined?.(data);
      });
    }

    if (callbacksRef.current.onUserLeft) {
      channel.bind('user-left', (data: { userId: string }) => {
        callbacksRef.current.onUserLeft?.(data.userId);
      });
    }

    if (callbacksRef.current.onUserUpdated) {
      channel.bind('user-updated', (data: { user: User }) => {
        callbacksRef.current.onUserUpdated?.(data.user);
      });
    }

    if (callbacksRef.current.onVotesUpdated) {
      channel.bind('votes-updated', (data: { userId: string; votesRemaining: number }) => {
        callbacksRef.current.onVotesUpdated?.(data.userId, data.votesRemaining);
      });
    }

    if (callbacksRef.current.onUserOnline) {
      channel.bind('user-online', (data: { user: User }) => {
        callbacksRef.current.onUserOnline?.(data.user);
      });
    }

    if (callbacksRef.current.onVoteCast) {
      channel.bind('vote-cast', (data: { userId: string; vote: string; voteCount: { against: number; neutral: number; favor: number } }) => {
        callbacksRef.current.onVoteCast?.(data);
      });
    }

    return () => {
      if (callbacksRef.current.onUserJoined) channel.unbind('user-joined');
      if (callbacksRef.current.onUserLeft) channel.unbind('user-left');
      if (callbacksRef.current.onUserUpdated) channel.unbind('user-updated');
      if (callbacksRef.current.onVotesUpdated) channel.unbind('votes-updated');
      if (callbacksRef.current.onUserOnline) channel.unbind('user-online');
      if (callbacksRef.current.onVoteCast) channel.unbind('vote-cast');
      unsubscribe(channelName);
    };
  }, [subscribe, unsubscribe, roomId]);
}

// Helper function to trigger user events
export async function triggerUserEvent(
  event: 'user-joined' | 'user-left' | 'user-updated' | 'votes-updated' | 'user-online' | 'vote-cast',
  data: any,
  roomId: string = 'global' // Default to global for backward compatibility
) {
  try {
    await fetch('/api/pusher/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        channel: `users-${roomId}`, // Use room-specific channel
      }),
    });
  } catch (error) {
    console.error('Failed to trigger user event:', error);
  }
}
