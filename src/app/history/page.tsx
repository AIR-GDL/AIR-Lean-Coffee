'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topic } from '@/types';
import { fetchDiscussionHistory } from '@/lib/api';
import ArrowBackIcon from '@/components/icons/ArrowBackIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import PersonIcon from '@/components/icons/PersonIcon';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchDiscussionHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Back to Board"
            >
              <ArrowBackIcon size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold" style={{ color: '#005596' }}>
                Discussion History
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                All completed discussions ({history.length} total)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <ClockIcon size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No discussions yet
            </h2>
            <p className="text-gray-500">
              Completed discussions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((topic) => (
              <div
                key={topic._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-l-4"
                style={{ borderLeftColor: '#005596' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {topic.title}
                    </h3>
                    {topic.description && (
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{topic.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <PersonIcon size={16} />
                        <span>{topic.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon size={16} />
                        <span>{formatDate(topic.discussedAt)}</span>
                      </div>
                      {topic.votes > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold" style={{ color: '#005596' }}>
                            {topic.votes}
                          </span>
                          <span>vote{topic.votes !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
