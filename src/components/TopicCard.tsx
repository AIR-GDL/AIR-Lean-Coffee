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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        className={`bg-card rounded-lg shadow-sm p-3 border hover:shadow-md transition-shadow overflow-hidden ${
          isDraggable ? 'cursor-grab active:cursor-grabbing hover:cursor-pointer' : 'cursor-pointer'
        } ${isDragging ? 'z-50' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate break-words text-sm">
              {topic.title}
            </h3>
            {topic.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                {topic.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              by {topic.author}
            </p>
          </div>
          
          {/* Vote Button - "to-discuss" */}
          {topic.status === 'to-discuss' && (
            <button
              onClick={handleVoteClick}
              disabled={!canVote && !hasUserVoted}
              className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-full font-semibold text-xs transition-all duration-300 group ${
                topic.votes > 0 || hasUserVoted
                  ? 'cursor-pointer'
                  : canVote
                  ? 'bg-muted text-muted-foreground hover:text-white cursor-pointer'
                  : 'bg-muted text-muted-foreground/50 cursor-not-allowed'
              }`}
              style={
                topic.votes > 0
                  ? { backgroundColor: '#005596', color: 'white' }
                  : hasUserVoted
                  ? { backgroundColor: '#005596', color: 'white' }
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
                if (topic.votes > 0) {
                  e.currentTarget.style.backgroundColor = '#005596';
                  e.currentTarget.style.color = 'white';
                } else if (hasUserVoted) {
                  e.currentTarget.style.backgroundColor = '#005596';
                  e.currentTarget.style.color = 'white';
                } else if (canVote && !hasUserVoted) {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }
              }}
              title={hasUserVoted ? 'Click to remove your vote' : 'Click to vote'}
            >
              <span className="group-hover:hidden transition-opacity duration-300">{topic.votes}</span>
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
              className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-muted-foreground hover:text-white transition-all duration-300 bg-muted hover:bg-[#005596] cursor-pointer"
              title="Archive topic"
            >
              <ArchiveIcon size={14} />
            </button>
          )}
          
          {topic.status !== 'to-discuss' && topic.status !== 'discussed' && topic.votes > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 shrink-0 rounded-full bg-muted text-muted-foreground font-semibold text-xs">
              <ThumbUpIcon size={14} />
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
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editedTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Topic title"
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editedDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  rows={4}
                  placeholder="Description (optional)"
                  disabled={!canEdit}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                {canEdit && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      className="bg-red-100 text-red-700 hover:bg-red-200 border-0"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="bg-[#005596] hover:bg-[#004478] text-white"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-foreground font-medium">
                Really want to delete this topic?
              </p>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteConfirming(false);
                    setDeleteCountdown(5);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteCountdown > 0}
                >
                  {deleteCountdown > 0 ? `Delete (${deleteCountdown}s)` : 'Confirm Delete'}
                </Button>
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
          <p className="text-muted-foreground">
            Are you sure you want to archive this topic? It will no longer appear in the Discussed column.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowArchiveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-[#005596] hover:bg-[#004478] text-white"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
