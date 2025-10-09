'use client';

import { Topic, User } from '@/types';
import { ThumbsUp } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TopicCardProps {
  topic: Topic;
  user: User;
  onVote: (topicId: string) => void;
  canVote: boolean;
  isDraggable?: boolean;
}

export default function TopicCard({ topic, user, onVote, canVote, isDraggable = true }: TopicCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic._id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canVote) {
      onVote(topic._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDraggable ? listeners : {})}
      className={`bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 hover:shadow-lg transition-shadow ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {topic.content}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            by {topic.author}
          </p>
        </div>
        
        {topic.status === 'to-discuss' && (
          <button
            onClick={handleVoteClick}
            disabled={!canVote}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm transition-all ${
              canVote
                ? 'bg-gray-100 text-gray-700 hover:bg-purple-600 hover:text-white'
                : 'bg-purple-100 text-purple-700 cursor-not-allowed'
            }`}
          >
            <ThumbsUp size={16} />
            <span>{topic.votes}</span>
          </button>
        )}
        
        {topic.status !== 'to-discuss' && topic.votes > 0 && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
            <ThumbsUp size={16} />
            <span>{topic.votes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
