import useSWR from 'swr';
import { User } from '@/types';
import { fetchAllUsers } from '@/lib/api';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<User[]>('/api/users/all', fetchAllUsers, {
    refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
    revalidateOnFocus: true,
  });

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
