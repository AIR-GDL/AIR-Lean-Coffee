'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import UserRegistration from '@/components/UserRegistration';
import Board from '@/components/Board';

export default function Home() {
  const [user, setUser] = useLocalStorage<User | null>('lean-coffee-user', null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <UserRegistration onRegister={handleRegister} />;
  }

  return <Board user={user} onLogout={handleLogout} />;
}
