'use client';

import { Topic, User, ColumnType } from '@/types';
import TopicCard from './TopicCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AddIcon from './icons/AddIcon';

interface ColumnProps {
  id: ColumnType;
  title: string;
  topics: Topic[];
  user: User;
  onVote: (topicId: string) => void;
  onAddTopic?: () => void;
  onUpdate?: () => void;
  onDelete?: (topicId: string) => void;
  children?: React.ReactNode;
}

export default function Column({ id, title, topics, user, onVote, onAddTopic, onUpdate, onDelete, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const canVote = user.votesRemaining > 0;

  // For "To Discuss" column, separate topics into voted and new
  const isToDiscussColumn = id === 'toDiscuss';
  const topVotedTopics = isToDiscussColumn ? topics.filter(t => t.votes > 0).sort((a, b) => b.votes - a.votes) : [];
  const newTopics = isToDiscussColumn ? topics.filter(t => t.votes === 0) : [];
  const regularTopics = !isToDiscussColumn ? topics : [];

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {id !== 'actions' && (
          <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
            {topics.length}
          </span>
        )}
      </div>

      {children && (
        <div className="p-4 border-b border-gray-200">
          {children}
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] ${
          isOver ? 'bg-blue-50' : ''
        }`}
      >
        {isToDiscussColumn ? (
          <>
            {topVotedTopics.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
                  Top Voted
                </div>
                <SortableContext items={topVotedTopics.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {topVotedTopics.map((topic) => (
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

            {newTopics.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  New Topics
                </div>
                <SortableContext items={newTopics.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
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
              <div className="text-center text-gray-400 py-8">
                No topics yet
              </div>
            )}
          </>
        ) : (
          <>
            <SortableContext items={regularTopics.map(t => t._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {regularTopics.map((topic) => (
                  <TopicCard
                    key={topic._id}
                    topic={topic}
                    user={user}
                    onVote={onVote}
                    canVote={false}
                    isDraggable={id === 'discussing'}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>

            {topics.length === 0 && id !== 'actions' && (
              <div className="text-center text-gray-400 py-8">
                No topics yet
              </div>
            )}
          </>
        )}
      </div>

      {onAddTopic && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onAddTopic}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: '#005596' }}
          >
            <AddIcon size={20} />
            Add Topic
          </button>
        </div>
      )}
    </div>
  );
}
