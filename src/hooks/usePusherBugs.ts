import { useEffect } from 'react';
import { usePusher } from '@/context/PusherContext';

interface PusherBugsCallbacks {
  onBugCreated?: () => void;
  onBugUpdated?: () => void;
  onBugDeleted?: () => void;
}

export function usePusherBugs(callbacks: PusherBugsCallbacks) {
  const { pusher } = usePusher();

  useEffect(() => {
    if (!pusher) return;

    const channel = pusher.subscribe('bugs');

    if (callbacks.onBugCreated) {
      channel.bind('bug-created', () => {
        callbacks.onBugCreated?.();
      });
    }

    if (callbacks.onBugUpdated) {
      channel.bind('bug-updated', () => {
        callbacks.onBugUpdated?.();
      });
    }

    if (callbacks.onBugDeleted) {
      channel.bind('bug-deleted', () => {
        callbacks.onBugDeleted?.();
      });
    }

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('bugs');
    };
  }, [pusher, callbacks]);
}

export async function triggerBugEvent(
  eventName: 'bug-created' | 'bug-updated' | 'bug-deleted',
  data: any
) {
  try {
    const response = await fetch('/api/pusher/bugs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger bug event');
    }
  } catch (error) {
    console.error('Error triggering bug event:', error);
  }
}
