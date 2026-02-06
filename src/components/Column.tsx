'use client';

import { Topic, User, ColumnType } from '@/types';
import TopicCard from './TopicCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ColumnProps {
  id: ColumnType;
  title: string;
  topics: Topic[];
  user: User;
  onVote: (topicId: string) => void;
  onAddTopic?: () => void;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  onUpdate?: () => void;
  onDelete?: (topicId: string) => void;
  children?: React.ReactNode;
}

export default function Column({ id, title, topics, user, onVote, onAddTopic, buttonLabel, buttonIcon, onUpdate, onDelete, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'Column',
      columnId: id,
    }
  });

  const canVote = user.votesRemaining > 0;

  const isToDiscussColumn = id === 'toDiscuss';
  const topVotedTopics = isToDiscussColumn ? topics.filter(t => t.votes > 0).sort((a, b) => b.votes - a.votes) : [];
  const newTopics = isToDiscussColumn ? topics.filter(t => t.votes === 0) : [];
  const regularTopics = !isToDiscussColumn ? topics : [];

  const isDraggableColumn = id === 'discussing' || id === 'discussed';

  return (
    <div className={`flex flex-col flex-1 w-full h-full min-h-0 min-w-0 bg-card rounded-xl border shadow-sm transition-all overflow-hidden ${
      isDraggableColumn && isOver ? 'border-2 border-dashed border-primary' : ''
    }`}>
      <div className="flex items-center justify-between px-4 py-3 border-b min-w-0 shrink-0">
        <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
        {id !== 'actions' && (
          <Badge variant="secondary" className="text-xs shrink-0">
            {topics.length}
          </Badge>
        )}
      </div>

      {children && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            {children}
          </div>
        </div>
      )}

      {!children && (
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-0 min-w-0 overflow-hidden transition-colors ${
            isDraggableColumn && isOver ? 'bg-primary/5' : ''
          }`}
        >
          <div className="h-full overflow-y-auto">
            <div className="p-3 space-y-2">
              {isToDiscussColumn ? (
                <>
                  {topVotedTopics.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                        Top Voted
                      </div>
                      <SortableContext items={topVotedTopics.map(t => t._id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {topVotedTopics.map((topic) => (
                            <TopicCard
                              key={topic._id}
                              topic={topic}
                              user={user}
                              onVote={onVote}
                              canVote={canVote}
                              isDraggable={true}
                              onUpdate={onUpdate}
                              onDelete={onDelete}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  )}

                  {newTopics.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        New Topics
                      </div>
                      <SortableContext items={newTopics.map(t => t._id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {newTopics.map((topic) => (
                            <TopicCard
                              key={topic._id}
                              topic={topic}
                              user={user}
                              onVote={onVote}
                              canVote={canVote}
                              onUpdate={onUpdate}
                              onDelete={onDelete}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  )}

                  {topics.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No topics yet
                    </div>
                  )}
                </>
              ) : (
                <>
                  <SortableContext items={regularTopics.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {regularTopics.map((topic) => (
                        <TopicCard
                          key={topic._id}
                          topic={topic}
                          user={user}
                          onVote={onVote}
                          canVote={false}
                          isDraggable={isDraggableColumn}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {topics.length === 0 && id !== 'actions' && (
                    <div className="text-center text-muted-foreground py-8">
                      No topics yet
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {onAddTopic && (
        <div className="p-3 border-t shrink-0">
          <Button
            onClick={onAddTopic}
            className="w-full bg-[#005596] hover:bg-[#004478] text-white"
            size="lg"
          >
            {buttonIcon || <Plus className="h-5 w-5" />}
            {buttonLabel || 'Add Topic'}
          </Button>
        </div>
      )}
    </div>
  );
}
