'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topic } from '@/types';
import { fetchDiscussionHistory } from '@/lib/api';
import ArrowBackIcon from '@/components/icons/ArrowBackIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import PersonIcon from '@/components/icons/PersonIcon';
import { usePusherHistory } from '@/hooks/usePusherHistory';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    // Check authentication
    const storedUser = sessionStorage.getItem('lean-coffee-user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
    loadHistory();
  }, [router]);

  // Subscribe to Pusher events for real-time updates
  usePusherHistory({
    onHistoryUpdated: () => loadHistory(),
  });

  const loadHistory = async () => {
    try {
      const data = await fetchDiscussionHistory();
      // Show only archived topics (completed discussions)
      const filteredData = data.filter(topic => topic.archived === true);
      setHistory(filteredData);
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

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
          <div className="flex gap-6">
            {/* Topics List */}
            <div className={`transition-all duration-300 ${selectedTopic ? 'flex-shrink-0 w-1/2' : 'flex-1'}`}>
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
                    onClick={() => setSelectedTopic(topic)}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 cursor-pointer ${
                      selectedTopic?._id === topic._id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{ borderLeftColor: '#005596' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {topic.description || 'No description'}
                        </p>
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
            </div>

            {/* Details Panel */}
            {selectedTopic && (
              <div className={`flex-shrink-0 w-1/2 bg-white rounded-lg border border-gray-200 overflow-y-auto transform transition-all duration-300 ease-out ${
                selectedTopic ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
                <div className="p-6">
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="mb-4 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    ← Back
                  </button>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedTopic.title}
                  </h2>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedTopic.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Author</h3>
                      <p className="text-gray-600 text-sm">{selectedTopic.author}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Discussed Date</h3>
                      <p className="text-gray-600 text-sm">{formatDate(selectedTopic.discussedAt)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Votes</h3>
                      <p className="text-gray-600 text-sm">{selectedTopic.votes} vote{selectedTopic.votes !== 1 ? 's' : ''}</p>
                    </div>

                    {selectedTopic.totalTimeDiscussed && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Time Discussed</h3>
                        <p className="text-gray-600 text-sm">
                          {Math.floor(selectedTopic.totalTimeDiscussed / 60)} min {selectedTopic.totalTimeDiscussed % 60} sec
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
