import { useEffect } from 'react';
import { usePusher } from '@/context/PusherContext';

interface TimerEvent {
  topicId: string;
  remainingSeconds?: number;
  isRunning?: boolean;
  isPaused?: boolean;
  durationMinutes?: number;
  startTime?: number;
}

interface UsePusherTimerProps {
  onTimerUpdated?: (timerData: TimerEvent) => void;
  onTimerStarted?: (timerData: TimerEvent) => void;
  onTimerPaused?: (timerData: TimerEvent) => void;
  onTimerStopped?: (topicId: string) => void;
}

export function usePusherTimer({
  onTimerUpdated,
  onTimerStarted,
  onTimerPaused,
  onTimerStopped,
}: UsePusherTimerProps) {
  const { subscribe, unsubscribe } = usePusher();

  useEffect(() => {
    const channel = subscribe('timer');
    if (!channel) return;

    if (onTimerUpdated) {
      channel.bind('timer-updated', (data: TimerEvent) => {
        onTimerUpdated(data);
      });
    }

    if (onTimerStarted) {
      channel.bind('timer-started', (data: TimerEvent) => {
        onTimerStarted(data);
      });
    }

    if (onTimerPaused) {
      channel.bind('timer-paused', (data: TimerEvent) => {
        onTimerPaused(data);
      });
    }

    if (onTimerStopped) {
      channel.bind('timer-stopped', (data: { topicId: string }) => {
        onTimerStopped(data.topicId);
      });
    }

    return () => {
      if (onTimerUpdated) channel.unbind('timer-updated');
      if (onTimerStarted) channel.unbind('timer-started');
      if (onTimerPaused) channel.unbind('timer-paused');
      if (onTimerStopped) channel.unbind('timer-stopped');
      unsubscribe('timer');
    };
  }, [subscribe, unsubscribe, onTimerUpdated, onTimerStarted, onTimerPaused, onTimerStopped]);
}

// Helper function to trigger timer events
export async function triggerTimerEvent(
  event: 'timer-updated' | 'timer-started' | 'timer-paused' | 'timer-stopped',
  data: any
) {
  try {
    await fetch('/api/pusher/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        channel: 'timer',
      }),
    });
  } catch (error) {
    console.error('Failed to trigger timer event:', error);
  }
}
