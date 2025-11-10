'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from './AppHeader';
import { User } from '@/types';

interface AppSettings {
  votesPerUser: number;
  minDiscussionMinutes: number;
  maxDiscussionMinutes: number;
  hideArchivedTopics: boolean;
}

interface SettingsViewProps {
  onBack: () => void;
  user: User;
  onLogout: () => void;
}

// Toast notification function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
    type === 'success'
      ? 'bg-green-500 text-white'
      : 'bg-red-500 text-white'
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

export default function SettingsView({ onBack, user, onLogout }: SettingsViewProps) {
  const [settings, setSettings] = useState<AppSettings>({
    votesPerUser: 3,
    minDiscussionMinutes: 1,
    maxDiscussionMinutes: 10,
    hideArchivedTopics: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        showToast('Failed to load settings', 'error');
      }
    };
    loadSettings();
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return async (settingsToSave: AppSettings) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          setIsLoading(true);
          try {
            const response = await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(settingsToSave),
            });

            if (response.ok) {
              showToast('Settings saved automatically');
            } else {
              const error = await response.json();
              showToast(`Failed to save settings: ${error.error}`, 'error');
            }
          } catch (error) {
            console.error('Failed to save settings:', error);
            showToast('Failed to save settings', 'error');
          } finally {
            setIsLoading(false);
          }
        }, 3000); // 3 seconds debounce
      };
    })(),
    []
  );

  // Save settings when they change
  useEffect(() => {
    debouncedSave(settings);
  }, [settings, debouncedSave]);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const incrementValue = (key: keyof Pick<AppSettings, 'votesPerUser' | 'minDiscussionMinutes' | 'maxDiscussionMinutes'>, max: number) => {
    updateSetting(key, Math.min(settings[key] as number + 1, max));
  };

  const decrementValue = (key: keyof Pick<AppSettings, 'votesPerUser' | 'minDiscussionMinutes' | 'maxDiscussionMinutes'>, min: number) => {
    updateSetting(key, Math.max(settings[key] as number - 1, min));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        variant="secondary"
        user={user}
        onLogout={onLogout}
        onBack={onBack}
        title="App Settings"
      />

      {/* Settings Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">App Settings</h1>
          <p className="text-gray-600 mt-2">Configure global application settings. Changes are saved automatically.</p>
          {isLoading && (
            <p className="text-sm text-blue-600 mt-2">Saving changes...</p>
          )}
        </div>

        {/* Voting Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voting Configuration</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Votes Per User
                </label>
                <p className="text-xs text-gray-500">
                  Number of votes each user gets to distribute among topics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decrementValue('votesPerUser', 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  disabled={settings.votesPerUser <= 1}
                >
                  <span className="text-lg font-bold text-gray-600">-</span>
                </button>
                <span className="text-lg font-bold text-blue-600 min-w-12 text-center">
                  {settings.votesPerUser}
                </span>
                <button
                  onClick={() => incrementValue('votesPerUser', 10)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  disabled={settings.votesPerUser >= 10}
                >
                  <span className="text-lg font-bold text-gray-600">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion Duration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Discussion Duration</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Minutes
                </label>
                <p className="text-xs text-gray-500">
                  Minimum time allowed for discussion duration
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decrementValue('minDiscussionMinutes', 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  disabled={settings.minDiscussionMinutes <= 1}
                >
                  <span className="text-lg font-bold text-gray-600">-</span>
                </button>
                <span className="text-lg font-bold text-blue-600 min-w-12 text-center">
                  {settings.minDiscussionMinutes}
                </span>
                <button
                  onClick={() => incrementValue('minDiscussionMinutes', settings.maxDiscussionMinutes - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  disabled={settings.minDiscussionMinutes >= settings.maxDiscussionMinutes - 1}
                >
                  <span className="text-lg font-bold text-gray-600">+</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Minutes
                </label>
                <p className="text-xs text-gray-500">
                  Maximum time allowed for discussion duration
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decrementValue('maxDiscussionMinutes', settings.minDiscussionMinutes + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  disabled={settings.maxDiscussionMinutes <= settings.minDiscussionMinutes + 1}
                >
                  <span className="text-lg font-bold text-gray-600">-</span>
                </button>
                <span className="text-lg font-bold text-blue-600 min-w-12 text-center">
                  {settings.maxDiscussionMinutes}
                </span>
                <button
                  onClick={() => incrementValue('maxDiscussionMinutes', 60)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  disabled={settings.maxDiscussionMinutes >= 60}
                >
                  <span className="text-lg font-bold text-gray-600">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibility Settings</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.hideArchivedTopics}
                onChange={(e) => updateSetting('hideArchivedTopics', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Hide Archived Topics</span>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, topics marked as discussed will not be visible in the main board
                </p>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
