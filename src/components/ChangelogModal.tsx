'use client';

import { useEffect, useState } from 'react';
import Modal from './Modal';
import { formatDate } from '@/lib/date';
import type { ChangelogEntry } from '@/lib/changelog-parser';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCurrent = true;

    const fetchChangelog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/changelog');

        if (!response.ok) {
          throw new Error('Unable to load changelog');
        }

        const data = (await response.json()) as { data?: ChangelogEntry[] };

        if (isCurrent) {
          setEntries(data.data ?? []);
        }
      } catch (fetchError) {
        if (isCurrent) {
          setError('Failed to load changelog. Please try again later.');
        }
        console.error('Failed to load changelog:', fetchError);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void fetchChangelog();

    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Changelog"
    >
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
        {isLoading && (
          <p className="text-sm text-gray-500">Loading changelog...</p>
        )}

        {error && !isLoading && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <p className="text-sm text-gray-500">No changelog entries available.</p>
        )}

        {!isLoading && !error && entries.map((entry) => (
          <div key={entry.version} className="border-l-4 border-blue-500 pl-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">v{entry.version}</h3>
              <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
            </div>
            <ul className="space-y-2">
              {entry.changes.map((change, index) => (
                <li key={`${entry.version}-${index}`} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: '#005596' }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
