import { useEffect, useRef } from 'react';
import { usePusher } from '@/context/PusherContext';
import type { User } from '@/types';

interface UsePusherUsersProps {
  onUserJoined?: (user: User) => void;
  onUserLeft?: (userId: string) => void;
  onUserUpdated?: (user: User) => void;
  onVotesUpdated?: (userId: string, votesRemaining: number) => void;
}

export function usePusherUsers({
  onUserJoined,
  onUserLeft,
  onUserUpdated,
  onVotesUpdated,
}: UsePusherUsersProps) {
  const { subscribe, unsubscribe } = usePusher();
  const callbacksRef = useRef({ onUserJoined, onUserLeft, onUserUpdated, onVotesUpdated });

  // Update callbacks ref without triggering effect
  useEffect(() => {
    callbacksRef.current = { onUserJoined, onUserLeft, onUserUpdated, onVotesUpdated };
  }, [onUserJoined, onUserLeft, onUserUpdated, onVotesUpdated]);

  useEffect(() => {
    const channel = subscribe('users');
    if (!channel) return;

    if (callbacksRef.current.onUserJoined) {
      channel.bind('user-joined', (data: { user: User }) => {
        callbacksRef.current.onUserJoined?.(data.user);
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

    return () => {
      if (callbacksRef.current.onUserJoined) channel.unbind('user-joined');
      if (callbacksRef.current.onUserLeft) channel.unbind('user-left');
      if (callbacksRef.current.onUserUpdated) channel.unbind('user-updated');
      if (callbacksRef.current.onVotesUpdated) channel.unbind('votes-updated');
      unsubscribe('users');
    };
  }, [subscribe, unsubscribe]);
}

// Helper function to trigger user events
export async function triggerUserEvent(
  event: 'user-joined' | 'user-left' | 'user-updated' | 'votes-updated',
  data: any
) {
  try {
    await fetch('/api/pusher/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        channel: 'users',
      }),
    });
  } catch (error) {
    console.error('Failed to trigger user event:', error);
  }
}
