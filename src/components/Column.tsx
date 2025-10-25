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

  // Determine if this column is draggable
  const isDraggableColumn = id === 'discussing' || id === 'discussed';

  return (
    <div className={`flex flex-col flex-1 w-full h-full min-h-0 bg-gray-50 rounded-xl shadow-sm transition-all ${
      isDraggableColumn && isOver ? 'border-2 border-dashed border-blue-500' : 'border-2 border-transparent'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 min-w-0">
        <h2 className="text-lg font-bold text-gray-900 truncate">{title}</h2>
        {id !== 'actions' && (
          <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full flex-shrink-0">
            {topics.length}
          </span>
        )}
      </div>

      {children && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          {children}
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto transition-colors ${
          isDraggableColumn && isOver ? 'bg-blue-100' : 'bg-gray-50'
        }`}
      >
        <div className="p-4 space-y-4 min-h-[300px]">
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
                    isDraggable={isDraggableColumn}
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
