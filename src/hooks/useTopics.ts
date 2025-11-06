import useSWR from 'swr';
import { Topic } from '@/types';
import { fetchTopics } from '@/lib/api';
import { usePusherTopics } from './usePusherTopics';

export function useTopics() {
  const { data, error, isLoading, mutate } = useSWR<Topic[]>('/api/topics', fetchTopics, {
    revalidateOnFocus: true,
  });

  // Subscribe to Pusher events for real-time updates
  usePusherTopics({
    onTopicCreated: () => mutate(),
    onTopicUpdated: () => mutate(),
    onTopicDeleted: () => mutate(),
    onTopicStatusChanged: () => mutate(),
  });

  return {
    topics: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
