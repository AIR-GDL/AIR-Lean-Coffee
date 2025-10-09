'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import UserRegistration from '@/components/UserRegistration';
import Board from '@/components/Board';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('lean-coffee-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem('lean-coffee-user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    // Save to sessionStorage for persistence during session
    sessionStorage.setItem('lean-coffee-user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    // Clear sessionStorage
    sessionStorage.removeItem('lean-coffee-user');
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
