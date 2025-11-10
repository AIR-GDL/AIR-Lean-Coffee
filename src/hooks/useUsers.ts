import useSWR from 'swr';
import { User } from '@/types';
import { fetchAllUsers } from '@/lib/api';
import { usePusherUsers } from './usePusherUsers';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<User[]>('/api/users/all', fetchAllUsers, {
    revalidateOnFocus: true,
  });

  // Subscribe to Pusher events for real-time updates
  usePusherUsers({
    onUserJoined: () => mutate(),
    onUserLeft: () => mutate(),
    onUserUpdated: () => mutate(),
    onVotesUpdated: () => mutate(),
    onUserOnline: () => mutate(), // Also update when users go online/offline
  });

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
