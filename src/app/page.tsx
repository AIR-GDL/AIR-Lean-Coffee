'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { LoginForm } from '@/components/login-form';
import Board from '@/components/Board';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadUserFromSession = () => {
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
    };

    loadUserFromSession();
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
    return null;
  }

  if (!user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm onRegister={handleRegister} />
        </div>
      </div>
    );
  }

  return <Board user={user} onLogout={handleLogout} />;
}
