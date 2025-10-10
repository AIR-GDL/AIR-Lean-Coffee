'use client';

import { useState } from 'react';
import { Topic, User } from '@/types';
import { ThumbsUp, Edit2, Save, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateTopic } from '@/lib/api';

interface TopicCardProps {
  topic: Topic;
  user: User;
  onVote: (topicId: string) => void;
  canVote: boolean;
  isDraggable?: boolean;
  onUpdate?: () => void;
}

export default function TopicCard({ topic, user, onVote, canVote, isDraggable = true, onUpdate }: TopicCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(topic.content);
  const [isSaving, setIsSaving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic._id, disabled: !isDraggable || isEditing });

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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedContent(topic.content);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editedContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await updateTopic(topic._id, { content: editedContent.trim() });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update topic:', error);
      alert('Failed to update topic. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedContent(topic.content);
  };

  const hasUserVoted = topic.votedBy.includes(user.email);
  const canEdit = topic.status === 'to-discuss';

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
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:border-transparent resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editedContent.trim() || isSaving}
                  className="flex items-center gap-1 px-2 py-1 text-white text-xs rounded hover:opacity-90 disabled:bg-gray-400"
                  style={{ backgroundColor: editedContent.trim() && !isSaving ? '#005596' : undefined }}
                >
                  <Save size={14} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 flex-1">
                  {topic.content}
                </h3>
                {canEdit && (
                  <button
                    onClick={handleEditClick}
                    className="p-1 text-gray-400 hover:text-gray-600 transition"
                    title="Edit topic"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                by {topic.author}
              </p>
            </>
          )}
        </div>
        
        {!isEditing && topic.status === 'to-discuss' && (
          <button
            onClick={handleVoteClick}
            disabled={!canVote || hasUserVoted}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm transition-all ${
              hasUserVoted
                ? 'cursor-not-allowed'
                : canVote
                ? 'bg-gray-100 text-gray-700 hover:text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            style={hasUserVoted ? { backgroundColor: '#e6f2f9', color: '#005596' } : {}}
            onMouseEnter={(e) => {
              if (canVote && !hasUserVoted) {
                e.currentTarget.style.backgroundColor = '#005596';
              }
            }}
            onMouseLeave={(e) => {
              if (canVote && !hasUserVoted) {
                e.currentTarget.style.backgroundColor = '';
              }
            }}
          >
            <ThumbsUp size={16} className={hasUserVoted ? 'fill-current' : ''} />
            <span>{topic.votes}</span>
          </button>
        )}
        
        {!isEditing && topic.status !== 'to-discuss' && topic.votes > 0 && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
            <ThumbsUp size={16} />
            <span>{topic.votes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
