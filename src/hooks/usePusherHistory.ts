import { useEffect } from 'react';
import { usePusher } from '@/context/PusherContext';

interface PusherHistoryCallbacks {
  onHistoryUpdated?: () => void;
}

export function usePusherHistory(callbacks: PusherHistoryCallbacks) {
  const { pusher } = usePusher();

  useEffect(() => {
    if (!pusher) return;

    const channel = pusher.subscribe('history');

    if (callbacks.onHistoryUpdated) {
      channel.bind('history-updated', () => {
        callbacks.onHistoryUpdated?.();
      });
    }

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('history');
    };
  }, [pusher, callbacks]);
}

export async function triggerHistoryEvent(
  eventName: 'history-updated',
  data: any
) {
  try {
    const response = await fetch('/api/pusher/history', {
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
      throw new Error('Failed to trigger history event');
    }
  } catch (error) {
    console.error('Error triggering history event:', error);
  }
}
