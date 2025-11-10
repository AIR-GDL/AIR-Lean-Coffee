import { useMemo } from 'react';
import type { User } from '@/types';

export function useIsAdmin(user: Pick<User, 'roles'> | null | undefined): boolean {
  return useMemo(() => {
    return Boolean(user?.roles?.includes('admin'));
  }, [user?.roles]);
}
