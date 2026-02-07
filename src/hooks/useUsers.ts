import useSWR from 'swr';
import { User } from '@/types';
import { fetchAllUsers } from '@/lib/api';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<User[]>('/api/users/all', fetchAllUsers, {
    revalidateOnFocus: true,
  });

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
