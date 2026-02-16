'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { FileText } from 'lucide-react';
import { formatDate } from '@/lib/date';
import type { ChangelogEntry } from '@/lib/changelog-parser';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const renderInlineMarkdown = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(<strong key={key++} className="font-semibold text-foreground">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }

    // Italic: _text_ or *text*
    const italicMatch = remaining.match(/^([\s\S]*?)(?:_(.+?)_|\*(.+?)\*)([\s\S]*)/);
    if (italicMatch) {
      if (italicMatch[1]) parts.push(italicMatch[1]);
      parts.push(<em key={key++}>{italicMatch[2] || italicMatch[3]}</em>);
      remaining = italicMatch[4];
      continue;
    }

    // Inline code: `text`
    const codeMatch = remaining.match(/^([\s\S]*?)`(.+?)`([\s\S]*)/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1]);
      parts.push(<code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{codeMatch[2]}</code>);
      remaining = codeMatch[3];
      continue;
    }

    parts.push(remaining);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
};

export default function ChangelogView() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const fetchChangelog = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/changelog');
        if (!response.ok) throw new Error('Unable to load changelog');
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
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <header className="flex-shrink-0 bg-background sticky top-0 flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Changelog</h1>
        <span className="text-sm text-muted-foreground ml-2">
          ({entries.length} releases)
        </span>
      </header>

      <main className="flex-1 overflow-auto min-h-0 p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl font-semibold text-muted-foreground">Loading changelog...</div>
          </div>
        )}

        {error && !isLoading && (
          <Card className="p-12 text-center">
            <CardContent className="p-0">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent className="p-0">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No changelog entries</h2>
              <p className="text-muted-foreground">Changelog entries will appear here</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && entries.length > 0 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {entries.map((entry) => (
              <Card key={entry.version} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-[#005596] hover:bg-[#004478] text-white text-sm px-3 py-1">
                      v{entry.version}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                  </div>
                  <div className="space-y-5">
                    {entry.sections.map((section, sIdx) => (
                      <div key={`${entry.version}-s${sIdx}`}>
                        {section.title && (
                          <h3 className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">
                            {section.title}
                          </h3>
                        )}
                        {section.items.length > 0 && (
                          <ul className="space-y-1.5">
                            {section.items.map((item, iIdx) => {
                              const isSubItem = item.startsWith('  ');
                              const displayText = isSubItem ? item.trimStart() : item;
                              return (
                                <li
                                  key={`${entry.version}-s${sIdx}-i${iIdx}`}
                                  className={`flex items-start gap-2 text-sm text-foreground/80 ${isSubItem ? 'ml-5' : ''}`}
                                >
                                  <span className={`mt-1.5 flex-shrink-0 rounded-full ${isSubItem ? 'h-1 w-1 bg-muted-foreground/40' : 'h-1.5 w-1.5 bg-[#005596]'}`} />
                                  <span className="break-words">{renderInlineMarkdown(displayText)}</span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ))}
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
