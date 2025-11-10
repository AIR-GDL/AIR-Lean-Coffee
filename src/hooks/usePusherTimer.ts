import { useEffect, useRef } from 'react';
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
  onDurationChanged?: (durationMinutes: number) => void;
}

export function usePusherTimer({
  onTimerUpdated,
  onTimerStarted,
  onTimerPaused,
  onTimerStopped,
  onDurationChanged,
}: UsePusherTimerProps) {
  const { subscribe, unsubscribe } = usePusher();
  const callbacksRef = useRef({ onTimerUpdated, onTimerStarted, onTimerPaused, onTimerStopped, onDurationChanged });

  // Update callbacks ref without triggering effect
  useEffect(() => {
    callbacksRef.current = { onTimerUpdated, onTimerStarted, onTimerPaused, onTimerStopped, onDurationChanged };
  }, [onTimerUpdated, onTimerStarted, onTimerPaused, onTimerStopped, onDurationChanged]);

  useEffect(() => {
    const channel = subscribe('timer');
    if (!channel) return;

    if (callbacksRef.current.onTimerUpdated) {
      channel.bind('timer-updated', (data: TimerEvent) => {
        callbacksRef.current.onTimerUpdated?.(data);
      });
    }

    if (callbacksRef.current.onTimerStarted) {
      channel.bind('timer-started', (data: TimerEvent) => {
        callbacksRef.current.onTimerStarted?.(data);
      });
    }

    if (callbacksRef.current.onTimerPaused) {
      channel.bind('timer-paused', (data: TimerEvent) => {
        callbacksRef.current.onTimerPaused?.(data);
      });
    }

    if (callbacksRef.current.onTimerStopped) {
      channel.bind('timer-stopped', (data: { topicId: string }) => {
        callbacksRef.current.onTimerStopped?.(data.topicId);
      });
    }

    if (callbacksRef.current.onDurationChanged) {
      channel.bind('duration-updated', (data: { durationMinutes: number }) => {
        callbacksRef.current.onDurationChanged?.(data.durationMinutes);
      });
    }

    return () => {
      if (callbacksRef.current.onTimerUpdated) channel.unbind('timer-updated');
      if (callbacksRef.current.onTimerStarted) channel.unbind('timer-started');
      if (callbacksRef.current.onTimerPaused) channel.unbind('timer-paused');
      if (callbacksRef.current.onTimerStopped) channel.unbind('timer-stopped');
      if (callbacksRef.current.onDurationChanged) channel.unbind('duration-updated');
      unsubscribe('timer');
    };
  }, [subscribe, unsubscribe]);
}

// Helper function to trigger timer events
export async function triggerTimerEvent(
  event: 'timer-updated' | 'timer-started' | 'timer-paused' | 'timer-stopped' | 'duration-updated',
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
