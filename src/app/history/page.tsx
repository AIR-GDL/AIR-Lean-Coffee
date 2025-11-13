'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topic } from '@/types';
import { fetchDiscussionHistory } from '@/lib/api';
import AppHeader from '@/components/AppHeader';
import ClockIcon from '@/components/icons/ClockIcon';
import PersonIcon from '@/components/icons/PersonIcon';
import { usePusherHistory } from '@/hooks/usePusherHistory';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';

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
      <AppHeader
        variant="secondary"
        onBack={() => router.push('/')}
        title="Discussion History"
        hideLogout={true}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-sm text-gray-600 mb-6">
            All completed discussions ({history.length} total)
          </p>
          
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
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 cursor-pointer"
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
      </main>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedTopic}
        onClose={() => setSelectedTopic(null)}
        title={selectedTopic?.title || ''}
      >
        {selectedTopic && (
          <div className="space-y-6">
            {/* Description */}
            <div>
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
        )}
      </Modal>

      {/* Footer */}
      <Footer />
    </div>
  );
}
