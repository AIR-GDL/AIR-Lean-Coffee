'use client';

import { useEffect, useState } from 'react';
import { Clock, User } from 'lucide-react';
import { Topic } from '@/types';
import { fetchDiscussionHistory } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function HistoryView() {
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

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <header className="flex-shrink-0 bg-background sticky top-0 flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Discussion History</h1>
        <span className="text-sm text-muted-foreground ml-2">
          ({history.length} total)
        </span>
      </header>

      <main className="flex-1 overflow-auto min-h-0 p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl font-semibold text-muted-foreground">Loading history...</div>
          </div>
        )}

        {!isLoading && history.length === 0 && (
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
        )}

        {!isLoading && history.length > 0 && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {history.map((topic) => (
              <Card
                key={topic._id}
                className="hover:shadow-md transition-shadow"
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
                      <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
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
