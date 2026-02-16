'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { Topic } from '@/types';
import { fetchDiscussionHistory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-semibold text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              title="Back to Board"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#005596]">
                Discussion History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                All completed discussions ({history.length} total)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {history.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent className="p-0">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No discussions yet
              </h2>
              <p className="text-muted-foreground">
                Completed discussions will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((topic) => (
              <Card
                key={topic._id}
                className="hover:shadow-md transition-shadow border-l-4 border-l-[#005596]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-foreground/80 mb-3 whitespace-pre-wrap">{topic.description}</p>
                      )}
                      <Separator className="my-3" />
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{topic.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(topic.discussedAt)}</span>
                        </div>
                        {topic.votes > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <span className="font-semibold text-[#005596]">
                              {topic.votes}
                            </span>
                            <span>vote{topic.votes !== 1 ? 's' : ''}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
