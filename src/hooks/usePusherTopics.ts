import { useEffect, useRef } from 'react';
import { usePusher } from '@/context/PusherContext';
import type { Topic } from '@/types';

interface UsePusherTopicsProps {
  onTopicCreated?: (topic: Topic) => void;
  onTopicUpdated?: (topic: Topic) => void;
  onTopicDeleted?: (topicId: string) => void;
  onTopicStatusChanged?: (topicId: string, status: string) => void;
}

export function usePusherTopics({
  onTopicCreated,
  onTopicUpdated,
  onTopicDeleted,
  onTopicStatusChanged,
}: UsePusherTopicsProps) {
  const { subscribe, unsubscribe } = usePusher();
  const callbacksRef = useRef({ onTopicCreated, onTopicUpdated, onTopicDeleted, onTopicStatusChanged });

  // Update callbacks ref without triggering effect
  useEffect(() => {
    callbacksRef.current = { onTopicCreated, onTopicUpdated, onTopicDeleted, onTopicStatusChanged };
  }, [onTopicCreated, onTopicUpdated, onTopicDeleted, onTopicStatusChanged]);

  useEffect(() => {
    const channel = subscribe('topics');
    if (!channel) return;

    // Listen for topic created event
    if (callbacksRef.current.onTopicCreated) {
      channel.bind('topic-created', (data: { topic: Topic }) => {
        callbacksRef.current.onTopicCreated?.(data.topic);
      });
    }

    // Listen for topic updated event
    if (callbacksRef.current.onTopicUpdated) {
      channel.bind('topic-updated', (data: { topic: Topic }) => {
        callbacksRef.current.onTopicUpdated?.(data.topic);
      });
    }

    // Listen for topic deleted event
    if (callbacksRef.current.onTopicDeleted) {
      channel.bind('topic-deleted', (data: { topicId: string }) => {
        callbacksRef.current.onTopicDeleted?.(data.topicId);
      });
    }

    // Listen for topic status changed event
    if (callbacksRef.current.onTopicStatusChanged) {
      channel.bind('topic-status-changed', (data: { topicId: string; status: string }) => {
        callbacksRef.current.onTopicStatusChanged?.(data.topicId, data.status);
      });
    }

    return () => {
      if (callbacksRef.current.onTopicCreated) channel.unbind('topic-created');
      if (callbacksRef.current.onTopicUpdated) channel.unbind('topic-updated');
      if (callbacksRef.current.onTopicDeleted) channel.unbind('topic-deleted');
      if (callbacksRef.current.onTopicStatusChanged) channel.unbind('topic-status-changed');
      unsubscribe('topics');
    };
  }, [subscribe, unsubscribe]);
}

// Helper function to trigger topic events
export async function triggerTopicEvent(
  event: 'topic-created' | 'topic-updated' | 'topic-deleted' | 'topic-status-changed',
  data: any
) {
  try {
    await fetch('/api/pusher/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        channel: 'topics',
      }),
    });
  } catch (error) {
    console.error('Failed to trigger topic event:', error);
  }
}
