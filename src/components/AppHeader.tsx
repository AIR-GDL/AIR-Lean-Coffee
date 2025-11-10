import { ReactNode } from 'react';
import Image from 'next/image';
import LogoutIcon from './icons/LogoutIcon';
import { User } from '@/types';

interface AppHeaderProps {
  user?: User;
  onLogout?: () => void;
  onBack?: () => void;
  title?: string;
  variant?: 'main' | 'secondary'; // main: with logo, secondary: with back button
  children?: ReactNode; // Content projection for additional elements
}

export default function AppHeader({
  user,
  onLogout,
  onBack,
  title,
  variant = 'main',
  children
}: AppHeaderProps) {
  if (variant === 'secondary') {
    return (
      <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Go back"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    className="text-gray-900"
                  >
                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
                  </svg>
                </button>
              )}
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-gray-500">Welcome</p>
                    <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.name}</p>
                  </div>
                  <div className="border-l border-gray-300 pl-6 flex flex-col justify-center">
                    <p className="text-xs text-gray-500">Votes Remaining</p>
                    <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.votesRemaining}/3</p>
                  </div>
                </div>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  title="Logout"
                >
                  <LogoutIcon size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Main variant (default)
  return (
    <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Image
              src="/lean_coffee_logo_long.svg"
              alt="AIR Lean Coffee"
              width={150}
              height={45}
              priority
              className="h-12 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-500">Welcome</p>
                  <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.name}</p>
                </div>
                <div className="border-l border-gray-300 pl-6 flex flex-col justify-center">
                  <p className="text-xs text-gray-500">Votes Remaining</p>
                  <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.votesRemaining}/3</p>
                </div>
              </div>
            )}
            {children}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Logout"
              >
                <LogoutIcon size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
