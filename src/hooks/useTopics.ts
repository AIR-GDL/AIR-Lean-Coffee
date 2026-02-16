import useSWR from 'swr';
import { Topic } from '@/types';
import { fetchTopics } from '@/lib/api';

export function useTopics() {
  const { data, error, isLoading, mutate } = useSWR<Topic[]>('/api/topics', fetchTopics, {
    revalidateOnFocus: true,
  });

  return {
    topics: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
