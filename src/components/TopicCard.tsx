'use client';

import { useState, useEffect } from 'react';
import { Topic, User } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateTopic } from '@/lib/api';
import { triggerHistoryEvent } from '@/hooks/usePusherHistory';
import ThumbUpIcon from './icons/ThumbUpIcon';
import ThumbDownIcon from './icons/ThumbDownIcon';
import ArchiveIcon from './icons/ArchiveIcon';
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
  const [showModal, setShowModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState(topic.title);
  const [editedDescription, setEditedDescription] = useState(topic.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [hasChanges, setHasChanges] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic._id, disabled: !isDraggable || showModal });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Countdown timer for delete confirmation
  useEffect(() => {
    if (isDeleteConfirming && deleteCountdown > 0) {
      const timer = setTimeout(() => {
        setDeleteCountdown(deleteCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDeleteConfirming, deleteCountdown]);

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canVote || hasUserVoted) {
      onVote(topic._id);
    }
  };

  const handleCardClick = () => {
    setShowModal(true);
    setEditedTitle(topic.title);
    setEditedDescription(topic.description || '');
    setHasChanges(false);
    setIsDeleteConfirming(false);
    setDeleteCountdown(5);
  };

  const handleTitleChange = (value: string) => {
    setEditedTitle(value);
    setHasChanges(value !== topic.title || editedDescription !== (topic.description || ''));
  };

  const handleDescriptionChange = (value: string) => {
    setEditedDescription(value);
    setHasChanges(editedTitle !== topic.title || value !== (topic.description || ''));
  };

  const handleSave = async () => {
    if (!editedTitle.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await updateTopic(topic._id, { 
        title: editedTitle.trim(),
        description: editedDescription.trim()
      });
      setShowModal(false);
      setHasChanges(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update topic:', error);
      alert('Failed to update topic. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditedTitle(topic.title);
    setEditedDescription(topic.description || '');
    setHasChanges(false);
    setIsDeleteConfirming(false);
    setDeleteCountdown(5);
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirming(true);
    setDeleteCountdown(5);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      onDelete(topic._id);
      setShowModal(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await updateTopic(topic._id, { archived: true });
      
      // Trigger Pusher event to update history in real-time
      await triggerHistoryEvent('history-updated', { topicId: topic._id, archived: true });
      
      setShowArchiveConfirm(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to archive topic:', error);
      alert('Failed to archive topic. Please try again.');
    } finally {
      setIsArchiving(false);
    }
  };

  const hasUserVoted = topic.votedBy.includes(user.email);
  const canEdit = topic.status === 'to-discuss';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(isDraggable ? listeners : {})}
        onClick={handleCardClick}
        className={`bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 hover:shadow-lg transition-shadow ${
          isDraggable ? 'cursor-grab active:cursor-grabbing hover:cursor-pointer' : 'cursor-pointer'
        } ${isDragging ? 'z-50' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate break-words">
              {topic.title}
            </h3>
            {topic.description && (
              <p className="text-sm text-gray-600 line-clamp-2 break-words">
                {topic.description}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              by {topic.author}
            </p>
          </div>
          
          {/* Vote Button - "to-discuss" */}
          {topic.status === 'to-discuss' && (
            <button
              onClick={handleVoteClick}
              disabled={!canVote && !hasUserVoted}
              className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs transition-all duration-300 group ${
                hasUserVoted
                  ? 'bg-blue-100 text-blue-600 hover:bg-red-600 hover:text-white cursor-pointer'
                  : canVote
                  ? 'bg-gray-200 text-gray-600 hover:text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={
                hasUserVoted
                  ? { backgroundColor: '#e6f2f9', color: '#005596' }
                  : {}
              }
              onMouseEnter={(e) => {
                if ((canVote && !hasUserVoted) || hasUserVoted) {
                  if (hasUserVoted) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.color = 'white';
                  } else {
                    e.currentTarget.style.backgroundColor = '#005596';
                    e.currentTarget.style.color = 'white';
                  }
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
              {/* Compact view: only number */}
              <span className="group-hover:hidden transition-opacity duration-300">{topic.votes}</span>
              
              {/* Expanded view: only icon */}
              <span className="hidden group-hover:flex items-center justify-center transition-opacity duration-300">
                {hasUserVoted ? (
                  <ThumbDownIcon size={14} filled={true} />
                ) : (
                  <ThumbUpIcon size={14} filled={false} />
                )}
              </span>
            </button>
          )}
          
          {/* Archive Button - "discussed" */}
          {topic.status === 'discussed' && !topic.archived && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowArchiveConfirm(true);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-white transition-all duration-300 group bg-gray-200 hover:bg-blue-600 cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#005596';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
              title="Archive topic"
            >
              <ArchiveIcon size={16} />
            </button>
          )}
          
          {topic.status !== 'to-discuss' && topic.status !== 'discussed' && topic.votes > 0 && (
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
              <ThumbUpIcon size={16} />
              <span>{topic.votes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Topic Details"
      >
        <div className="space-y-4">
          {!isDeleteConfirming ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Topic title"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Description (optional)"
                  disabled={!canEdit}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                {canEdit && (
                  <>
                    <button
                      onClick={handleDeleteClick}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-400 transition"
                      style={{ backgroundColor: hasChanges && !isSaving ? '#005596' : undefined }}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">
                Really want to delete this topic?
              </p>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={() => {
                    setIsDeleteConfirming(false);
                    setDeleteCountdown(5);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteCountdown > 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                >
                  {deleteCountdown > 0 ? `Delete (${deleteCountdown}s)` : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        title="Archive Topic"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to archive this topic? It will no longer appear in the Discussed column.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => setShowArchiveConfirm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
