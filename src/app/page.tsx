'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import UserRegistration from '@/components/UserRegistration';
import Board from '@/components/Board';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
    <div className="text-2xl font-semibold text-gray-700">Loading...</div>
  </div>
);

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load user from sessionStorage on mount
    try {
      const storedUser = sessionStorage.getItem('lean-coffee-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user from sessionStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    try {
      sessionStorage.setItem('lean-coffee-user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to save user to sessionStorage:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('lean-coffee-user');
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  };

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <UserRegistration onRegister={handleRegister} />;
  }

  return <Board user={user} onLogout={handleLogout} />;
}
