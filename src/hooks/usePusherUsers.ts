import { useEffect } from 'react';
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

  useEffect(() => {
    const channel = subscribe('users');
    if (!channel) return;

    if (onUserJoined) {
      channel.bind('user-joined', (data: { user: User }) => {
        onUserJoined(data.user);
      });
    }

    if (onUserLeft) {
      channel.bind('user-left', (data: { userId: string }) => {
        onUserLeft(data.userId);
      });
    }

    if (onUserUpdated) {
      channel.bind('user-updated', (data: { user: User }) => {
        onUserUpdated(data.user);
      });
    }

    if (onVotesUpdated) {
      channel.bind('votes-updated', (data: { userId: string; votesRemaining: number }) => {
        onVotesUpdated(data.userId, data.votesRemaining);
      });
    }

    return () => {
      if (onUserJoined) channel.unbind('user-joined');
      if (onUserLeft) channel.unbind('user-left');
      if (onUserUpdated) channel.unbind('user-updated');
      if (onVotesUpdated) channel.unbind('votes-updated');
      unsubscribe('users');
    };
  }, [subscribe, unsubscribe, onUserJoined, onUserLeft, onUserUpdated, onVotesUpdated]);
}

// Helper function to trigger user events
export async function triggerUserEvent(
  event: 'user-joined' | 'user-left' | 'user-updated' | 'votes-updated',
  data: any
) {
  try {
    await fetch('/api/pusher/topics', {
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
