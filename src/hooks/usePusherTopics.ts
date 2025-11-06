import { useEffect } from 'react';
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

  useEffect(() => {
    const channel = subscribe('topics');
    if (!channel) return;

    // Listen for topic created event
    if (onTopicCreated) {
      channel.bind('topic-created', (data: { topic: Topic }) => {
        onTopicCreated(data.topic);
      });
    }

    // Listen for topic updated event
    if (onTopicUpdated) {
      channel.bind('topic-updated', (data: { topic: Topic }) => {
        onTopicUpdated(data.topic);
      });
    }

    // Listen for topic deleted event
    if (onTopicDeleted) {
      channel.bind('topic-deleted', (data: { topicId: string }) => {
        onTopicDeleted(data.topicId);
      });
    }

    // Listen for topic status changed event
    if (onTopicStatusChanged) {
      channel.bind('topic-status-changed', (data: { topicId: string; status: string }) => {
        onTopicStatusChanged(data.topicId, data.status);
      });
    }

    return () => {
      if (onTopicCreated) channel.unbind('topic-created');
      if (onTopicUpdated) channel.unbind('topic-updated');
      if (onTopicDeleted) channel.unbind('topic-deleted');
      if (onTopicStatusChanged) channel.unbind('topic-status-changed');
      unsubscribe('topics');
    };
  }, [subscribe, unsubscribe, onTopicCreated, onTopicUpdated, onTopicDeleted, onTopicStatusChanged]);
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
