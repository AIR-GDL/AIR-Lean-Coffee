'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { User, TimerSettings, ColumnType } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTopics } from '@/hooks/useTopics';
import { useUsers } from '@/hooks/useUsers';
import { createTopic, updateTopic, deleteTopic } from '@/lib/api';
import Column from './Column';
import TopicCard from './TopicCard';
import Timer from './Timer';
import Modal from './Modal';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import ClockIcon from './icons/ClockIcon';
import LogoutIcon from './icons/LogoutIcon';
import HistoryIcon from './icons/HistoryIcon';
import PeopleIcon from './icons/PeopleIcon';
import StopIcon from './icons/StopIcon';

interface BoardProps {
  user: User;
  onLogout: () => void;
}

// Helper function to map DB status to column ID
const statusToColumnId = (status: string): ColumnType => {
  const mapping: Record<string, ColumnType> = {
    'to-discuss': 'toDiscuss',
    'discussing': 'discussing',
    'discussed': 'discussed',
  };
  return mapping[status] || 'toDiscuss';
};

// Helper function to map column ID to DB status
const columnIdToStatus = (columnId: ColumnType): 'to-discuss' | 'discussing' | 'discussed' => {
  const mapping: Record<string, 'to-discuss' | 'discussing' | 'discussed'> = {
    toDiscuss: 'to-discuss',
    discussing: 'discussing',
    discussed: 'discussed',
  };
  return mapping[columnId] || 'to-discuss';
};

export default function Board({ user: initialUser, onLogout }: BoardProps) {
  const router = useRouter();
  const { topics, isLoading, mutate } = useTopics();
  const { users, mutate: mutateUsers } = useUsers();
  const [user, setUser] = useState<User>(initialUser);
  const [timerSettings, setTimerSettings] = useLocalStorage<TimerSettings>('lean-coffee-timer', {
    durationMinutes: 5,
    isRunning: false,
    startTime: null,
    remainingSeconds: null,
    currentTopicId: null,
    isPaused: false,
    pausedRemainingSeconds: null,
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showConfirmDiscussModal, setShowConfirmDiscussModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [pendingTopicMove, setPendingTopicMove] = useState<{ topicId: string } | null>(null);
  const [userVote, setUserVote] = useState<'finish' | 'continue' | null>(null);
  const [showAddTimeSlider, setShowAddTimeSlider] = useState(false);
  const [additionalMinutes, setAdditionalMinutes] = useState(5);
  
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Update user in state when initialUser changes
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Update current user when users list changes (vote returns)
  useEffect(() => {
    if (user && users.length > 0) {
      const updatedUser = users.find(u => u.email === user.email);
      if (updatedUser && updatedUser.votesRemaining !== user.votesRemaining) {
        setUser(updatedUser);
        // Also update sessionStorage
        sessionStorage.setItem('lean-coffee-user', JSON.stringify(updatedUser));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const getTopicsByColumn = (columnId: ColumnType) => {
    const dbStatus = columnIdToStatus(columnId);
    return topics.filter(topic => topic.status === dbStatus);
  };

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTopic({
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim(),
        author: user.name,
      });
      
      await mutate(); // Refresh topics
      setNewTopicTitle('');
      setNewTopicDescription('');
      setShowAddTopicModal(false);
    } catch (error) {
      console.error('Failed to create topic:', error);
      alert('Failed to create topic. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (topicId: string) => {
    if (user.votesRemaining <= 0) {
      alert('No votes remaining!');
      return;
    }

    try {
      const response = await updateTopic(topicId, {
        action: 'VOTE',
        userEmail: user.email,
      });

      // Update local user state with new votes remaining
      if ('user' in response) {
        setUser(response.user);
      }

      await mutate(); // Refresh topics
    } catch (error) {
      console.error('Failed to vote:', error);
      alert(error instanceof Error ? error.message : 'Failed to vote. Please try again.');
    }
  };

  const triggerTrashConfetti = () => {
    // Create custom trash can emoji shape for confetti
    const scalar = 2;
    const trashCan = confetti.shapeFromText({ text: '🗑️', scalar });

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [trashCan],
      scalar
    };

    confetti({
      ...defaults,
      particleCount: 50,
      scalar: scalar * 1.5,
      origin: { y: 0.6 }
    });
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await deleteTopic(topicId);
      await mutate(); // Refresh topics
      
      // Trigger trash confetti animation
      setTimeout(() => {
        triggerTrashConfetti();
      }, 100);
    } catch (error) {
      console.error('Failed to delete topic:', error);
      alert('Failed to delete topic. Please try again.');
    }
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const topicId = active.id as string;
    const targetColumnId = over.id as ColumnType;
    const topic = topics.find(t => t._id === topicId);

    if (!topic || statusToColumnId(topic.status) === targetColumnId) return;

    // Only allow moving to "Discussing" from "Top Voted" section
    if (targetColumnId === 'discussing') {
      if (topic.status === 'to-discuss' && topic.votes > 0) {
        setPendingTopicMove({ topicId });
        setShowConfirmDiscussModal(true);
      }
      return;
    }

    // Prevent moving to other columns inappropriately
    if (targetColumnId === 'toDiscuss' || targetColumnId === 'discussed' || targetColumnId === 'actions') {
      return;
    }
  };

  const handleConfirmDiscuss = async () => {
    if (!pendingTopicMove) return;

    const { topicId } = pendingTopicMove;
    
    try {
      await updateTopic(topicId, {
        status: 'discussing',
      });

      // Start timer
      setTimerSettings({
        ...timerSettings,
        isRunning: true,
        startTime: Date.now(),
        remainingSeconds: timerSettings.durationMinutes * 60,
        currentTopicId: topicId,
      });

      await mutate(); // Refresh topics
      setShowConfirmDiscussModal(false);
      setPendingTopicMove(null);
    } catch (error) {
      console.error('Failed to update topic status:', error);
      alert('Failed to start discussion. Please try again.');
    }
  };

  const handleTimerComplete = () => {
    // Mark timer as paused at 0 seconds
    setTimerSettings({
      ...timerSettings,
      isRunning: false,
      isPaused: true,
      pausedRemainingSeconds: 0,
    });
    setShowVotingModal(true);
    setUserVote(null);
  };

  const handleVoteSubmit = async (vote: 'finish' | 'continue') => {
    setUserVote(vote);
    
    // In a real app, this would collect votes from all users
    // For now, we'll simulate immediate action
    setTimeout(async () => {
      if (vote === 'finish') {
        // Move topic to discussed
        const currentTopicId = timerSettings.currentTopicId;
        if (currentTopicId && timerSettings.startTime) {
          try {
            // Calculate elapsed time in seconds
            const elapsedSeconds = Math.floor((Date.now() - timerSettings.startTime) / 1000);
            
            // Get current topic to add to existing time
            const currentTopic = topics.find(t => t._id === currentTopicId);
            const totalTime = (currentTopic?.totalTimeDiscussed || 0) + elapsedSeconds;
            
            await updateTopic(currentTopicId, {
              status: 'discussed',
              totalTimeDiscussed: totalTime,
            });

            await mutate(); // Refresh topics
            await mutateUsers(); // Refresh users to update vote counts
          } catch (error) {
            console.error('Failed to finish topic:', error);
          }
        }

        // Reset timer
        setTimerSettings({
          ...timerSettings,
          isRunning: false,
          startTime: null,
          remainingSeconds: null,
          currentTopicId: null,
          isPaused: false,
          pausedRemainingSeconds: null,
        });
      } else {
        // Continue discussion
        if (timerSettings.isPaused && timerSettings.pausedRemainingSeconds !== null) {
          if (timerSettings.pausedRemainingSeconds === 0) {
            // Timer expired - don't close modal, show add time slider instead
            setShowAddTimeSlider(true);
            return; // Exit early, don't close modal
          } else {
            // Finish early was clicked - resume from paused time
            // Keep original startTime to track total duration
            setTimerSettings({
              ...timerSettings,
              isRunning: true,
              isPaused: false,
              // Keep original startTime to track total duration from start
              remainingSeconds: timerSettings.pausedRemainingSeconds,
              pausedRemainingSeconds: null,
            });
          }
        }
      }

      // Close modal first
      setShowVotingModal(false);
      setUserVote(null);
      setShowAddTimeSlider(false);

      // Trigger confetti AFTER modal closes (only for finish action)
      if (vote === 'finish') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 100);
      }
    }, 500);
  };

  const handleAddTimeConfirm = () => {
    // Add the selected time and restart timer
    // Keep the original startTime to track total discussion duration
    setTimerSettings({
      ...timerSettings,
      isRunning: true,
      isPaused: false,
      // Keep original startTime to track total duration
      remainingSeconds: additionalMinutes * 60,
      pausedRemainingSeconds: null,
    });
    setShowAddTimeSlider(false);
    setShowVotingModal(false);
    setUserVote(null);
  };

  const handleFinishEarly = () => {
    // Pause the timer and store current remaining time
    setTimerSettings({
      ...timerSettings,
      isRunning: false,
      isPaused: true,
      pausedRemainingSeconds: timerSettings.remainingSeconds,
    });
    setShowVotingModal(true);
    setUserVote(null);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const activeTopic = activeId ? topics.find(t => t._id === activeId) : null;

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center py-20">
        <div className="text-2xl font-semibold text-gray-700">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AIR Lean Coffee</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-500">Welcome</p>
                  <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.name}</p>
                </div>
                <div className="border-l border-gray-300 pl-6 flex flex-col justify-center">
                  <p className="text-xs text-gray-500">Votes Remaining</p>
                  <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.votesRemaining}/3</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Logout"
              >
                <LogoutIcon size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Timer Display */}
      {timerSettings.isRunning && timerSettings.remainingSeconds !== null && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <Timer
              remainingSeconds={timerSettings.remainingSeconds}
              onTimeUp={handleTimerComplete}
            />
            {/* Active Topic Display */}
            {timerSettings.currentTopicId && (() => {
              const currentTopic = topics.find(t => t._id === timerSettings.currentTopicId);
              return currentTopic ? (
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: '#005596' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{currentTopic.title}</h2>
                      {currentTopic.description && (
                        <p className="text-gray-700 whitespace-pre-wrap">{currentTopic.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-3">by {currentTopic.author}</p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            <div className="flex justify-center">
              <button
                onClick={handleFinishEarly}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 font-semibold rounded-lg hover:bg-gray-50 transition shadow-md"
                style={{ borderColor: '#005596', color: '#005596' }}
              >
                <StopIcon size={20} />
                Finish Early
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
            <Column
              id="toDiscuss"
              title="To Discuss"
              topics={getTopicsByColumn('toDiscuss')}
              user={user}
              onVote={handleVote}
              onAddTopic={() => setShowAddTopicModal(true)}
              onUpdate={() => mutate()}
              onDelete={handleDeleteTopic}
            />

            <Column
              id="discussing"
              title="Discussing"
              topics={getTopicsByColumn('discussing')}
              user={user}
              onVote={handleVote}
              onUpdate={() => mutate()}
              onDelete={handleDeleteTopic}
            />

            <Column
              id="discussed"
              title="Discussed"
              topics={getTopicsByColumn('discussed')}
              user={user}
              onVote={handleVote}
              onUpdate={() => mutate()}
              onDelete={handleDeleteTopic}
            />

            <Column
              id="actions"
              title="Controls & Info"
              topics={[]}
              user={user}
              onVote={handleVote}
            >
              <div className="space-y-6">
                {/* Discussion Duration */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon size={16} />
                    Discussion Duration
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={timerSettings.durationMinutes}
                    onChange={(e) => setTimerSettings({ ...timerSettings, durationMinutes: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: '#005596' }}
                    disabled={timerSettings.isRunning}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>1 min</span>
                    <span className="font-bold" style={{ color: '#005596' }}>{timerSettings.durationMinutes} min</span>
                    <span>20 min</span>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <PeopleIcon size={16} />
                    Participants
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {users.map((participant) => (
                      <div
                        key={participant._id}
                        className="flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-200"
                      >
                        <span className="font-medium text-gray-700 truncate">{participant.name}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: '#e6f2f9', color: '#005596' }}>
                          {participant.votesRemaining} vote{participant.votesRemaining !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discussion History Button */}
                <button
                  onClick={() => router.push('/history')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg transition hover:opacity-90"
                  style={{ backgroundColor: '#005596' }}
                >
                  <HistoryIcon size={20} />
                  View Discussion History
                </button>
              </div>
            </Column>
          </div>

          <DragOverlay>
            {activeTopic ? (
              <TopicCard
                topic={activeTopic}
                user={user}
                onVote={() => {}}
                canVote={false}
                isDraggable={false}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Add Topic Modal */}
      <Modal
        isOpen={showAddTopicModal}
        onClose={() => setShowAddTopicModal(false)}
        title="Add New Topic"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              placeholder="Enter topic title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newTopicDescription}
              onChange={(e) => setNewTopicDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
              placeholder="Add additional details (optional)"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddTopicModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleAddTopic}
              disabled={!newTopicTitle.trim() || isSubmitting}
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: !newTopicTitle.trim() || isSubmitting ? undefined : '#005596' }}
            >
              {isSubmitting ? 'Adding...' : 'Add Topic'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Discuss Modal */}
      <Modal
        isOpen={showConfirmDiscussModal}
        onClose={() => {
          setShowConfirmDiscussModal(false);
          setPendingTopicMove(null);
        }}
        title="Start Discussion?"
      >
        <p className="mb-6">Are you sure you want to start discussing this topic?</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowConfirmDiscussModal(false);
              setPendingTopicMove(null);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDiscuss}
            className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: '#005596' }}
          >
            Confirm
          </button>
        </div>
      </Modal>

      {/* Voting Modal */}
      <Modal
        isOpen={showVotingModal}
        onClose={() => {}}
        title={showAddTimeSlider ? "Add More Time" : "Time's Up! Vote on Next Action"}
        showCloseButton={false}
      >
        {showAddTimeSlider ? (
          // Add time slider UI
          <div className="space-y-4">
            <p className="text-gray-700">Select additional time to continue the discussion:</p>
            <div>
              <input
                type="range"
                min="1"
                max="10"
                value={additionalMinutes}
                onChange={(e) => setAdditionalMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: '#005596' }}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1 min</span>
                <span className="font-bold text-lg" style={{ color: '#005596' }}>{additionalMinutes} minutes</span>
                <span>10 min</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAddTimeSlider(false);
                  setShowVotingModal(false);
                  setUserVote(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTimeConfirm}
                className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition"
                style={{ backgroundColor: '#005596' }}
              >
                Add Time & Continue
              </button>
            </div>
          </div>
        ) : (
          // Initial vote buttons
          <>
            <p className="mb-6">Should we finish this topic or continue the discussion?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleVoteSubmit('finish')}
                disabled={userVote !== null}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                  userVote === 'finish'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white'
                } disabled:cursor-not-allowed`}
              >
                {userVote === 'finish' ? '✓ Voted to ' : ''}Finish Topic
              </button>
              <button
                onClick={() => handleVoteSubmit('continue')}
                disabled={userVote !== null}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                  userVote === 'continue'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white'
                } disabled:cursor-not-allowed`}
              >
                {userVote === 'continue' ? '✓ Voted to ' : ''}Continue Discussion
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
