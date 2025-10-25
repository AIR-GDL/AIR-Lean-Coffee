'use client';

import { useState } from 'react';
import { Topic, User } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateTopic } from '@/lib/api';
import ThumbUpIcon from './icons/ThumbUpIcon';
import EditIcon from './icons/EditIcon';
import Modal from './Modal';

interface TopicCardProps {
  topic: Topic;
  user: User;
  onVote: (topicId: string) => void;
  canVote: boolean;
  isDraggable?: boolean;
  onUpdate?: () => void;
  onDelete?: (topicId: string) => void;
}

export default function TopicCard({ topic, user, onVote, canVote, isDraggable = true, onUpdate, onDelete }: TopicCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(topic.title);
  const [editedDescription, setEditedDescription] = useState(topic.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    if (canVote || hasUserVoted) {
      onVote(topic._id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedTitle(topic.title);
    setEditedDescription(topic.description || '');
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editedTitle.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await updateTopic(topic._id, { 
        title: editedTitle.trim(),
        description: editedDescription.trim()
      });
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
    setEditedTitle(topic.title);
    setEditedDescription(topic.description || '');
    setShowDeleteConfirm(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(topic._id);
      setShowDeleteConfirm(false);
      setIsEditing(false);
    }
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
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:border-transparent font-semibold overflow-hidden truncate"
                placeholder="Topic title"
                autoFocus
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:border-transparent resize-none overflow-hidden"
                rows={3}
                placeholder="Description (optional)"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editedTitle.trim() || isSaving}
                  className="px-3 py-1.5 text-white text-xs rounded hover:opacity-90 disabled:bg-gray-400"
                  style={{ backgroundColor: editedTitle.trim() && !isSaving ? '#005596' : undefined }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate break-words">
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 break-words">
                      {topic.description}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <button
                    onClick={handleEditClick}
                    className="p-1 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                    title="Edit topic"
                  >
                    <EditIcon size={16} />
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
            disabled={!canVote && !hasUserVoted}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm transition-all ${
              hasUserVoted
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer'
                : canVote
                ? 'bg-gray-100 text-gray-700 hover:text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            style={hasUserVoted ? { backgroundColor: '#e6f2f9', color: '#005596' } : {}}
            onMouseEnter={(e) => {
              if ((canVote && !hasUserVoted) || hasUserVoted) {
                e.currentTarget.style.backgroundColor = '#005596';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (hasUserVoted) {
                e.currentTarget.style.backgroundColor = '#e6f2f9';
                e.currentTarget.style.color = '#005596';
              } else if (canVote && !hasUserVoted) {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = '';
              }
            }}
            title={hasUserVoted ? 'Click to remove your vote' : 'Click to vote'}
          >
            <ThumbUpIcon size={16} filled={hasUserVoted} />
            <span>{topic.votes}</span>
          </button>
        )}
        
        {!isEditing && topic.status !== 'to-discuss' && topic.votes > 0 && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
            <ThumbUpIcon size={16} />
            <span>{topic.votes}</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Topic"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this topic permanently? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
