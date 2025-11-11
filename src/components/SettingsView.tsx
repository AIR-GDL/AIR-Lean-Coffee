'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from './AppHeader';
import Footer from './Footer';
import { User } from '@/types';
import { toast } from '@/lib/toast';

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

export default function SettingsView({ onBack, user, onLogout }: SettingsViewProps) {
  const [settings, setSettings] = useState<AppSettings>({
    votesPerUser: 3,
    minDiscussionMinutes: 1,
    maxDiscussionMinutes: 10,
    hideArchivedTopics: false,
  });
  const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setOriginalSettings(data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
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
          // Only save if settings have changed from original
          if (originalSettings && JSON.stringify(settingsToSave) === JSON.stringify(originalSettings)) {
            return;
          }

          setIsSaving(true);
          try {
            const response = await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(settingsToSave),
            });

            if (response.ok) {
              setOriginalSettings(settingsToSave);
              toast.success('Settings saved');
            } else {
              const error = await response.json();
              toast.error(`Failed to save settings: ${error.error}`);
            }
          } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
          } finally {
            setIsSaving(false);
          }
        }, 2000); // 2 seconds debounce
      };
    })(),
    [originalSettings]
  );

  // Save settings when they change
  useEffect(() => {
    if (!isLoading && originalSettings) {
      debouncedSave(settings);
    }
  }, [settings, debouncedSave, isLoading, originalSettings]);

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

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-50">
        <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
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
              <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-50">
      <AppHeader
        variant="secondary"
        user={user}
        onLogout={onLogout}
        onBack={onBack}
        title="App Settings"
      />

      {/* Settings Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <p className="text-gray-600 mt-2">Configure global application settings. Changes are saved automatically.</p>
            {isSaving && (
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
      </main>

      <Footer />
    </div>
  );
}
