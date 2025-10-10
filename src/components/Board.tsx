'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Topic, User, TimerSettings, ColumnType } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTopics } from '@/hooks/useTopics';
import { useUsers } from '@/hooks/useUsers';
import { createTopic, updateTopic, fetchAllUsers } from '@/lib/api';
import Column from './Column';
import TopicCard from './TopicCard';
import Timer from './Timer';
import Modal from './Modal';
import confetti from 'canvas-confetti';
import { Clock, LogOut, History, Users, StopCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showConfirmDiscussModal, setShowConfirmDiscussModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [pendingTopicMove, setPendingTopicMove] = useState<{ topicId: string } | null>(null);
  const [userVote, setUserVote] = useState<'finish' | 'continue' | null>(null);
  
  const [newTopicContent, setNewTopicContent] = useState('');
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
  }, [users]);

  const getTopicsByColumn = (columnId: ColumnType) => {
    const dbStatus = columnIdToStatus(columnId);
    return topics.filter(topic => topic.status === dbStatus);
  };

  const handleAddTopic = async () => {
    if (!newTopicContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTopic({
        content: newTopicContent.trim(),
        author: user.name,
      });
      
      await mutate(); // Refresh topics
      setNewTopicContent('');
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
    } catch (error: any) {
      console.error('Failed to vote:', error);
      alert(error.message || 'Failed to vote. Please try again.');
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
        if (currentTopicId) {
          try {
            await updateTopic(currentTopicId, {
              status: 'discussed',
            });

            // Trigger confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
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
        });
      } else {
        // Continue discussion - reset timer (BUG FIX)
        setTimerSettings({
          ...timerSettings,
          isRunning: true, // Keep running
          startTime: Date.now(), // New start time
          remainingSeconds: timerSettings.durationMinutes * 60, // Reset to duration
        });
      }

      setShowVotingModal(false);
      setUserVote(null);
    }, 500);
  };

  const handleFinishEarly = () => {
    // Trigger the same voting modal as when timer completes
    setShowVotingModal(true);
    setUserVote(null);
    // Pause the timer
    setTimerSettings({
      ...timerSettings,
      isRunning: false,
    });
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const activeTopic = activeId ? topics.find(t => t._id === activeId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lean Coffee Board</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Votes Remaining</p>
                <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.votesRemaining}/3</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut size={20} />
                Logout
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
            <div className="flex justify-center">
              <button
                onClick={handleFinishEarly}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition shadow-md"
                style={{ borderColor: '#005596' }}
              >
                <StopCircle size={20} style={{ color: '#005596' }} />
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
            />

            <Column
              id="discussing"
              title="Discussing"
              topics={getTopicsByColumn('discussing')}
              user={user}
              onVote={handleVote}
              onUpdate={() => mutate()}
            />

            <Column
              id="discussed"
              title="Discussed"
              topics={getTopicsByColumn('discussed')}
              user={user}
              onVote={handleVote}
              onUpdate={() => mutate()}
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
                    <Clock size={16} />
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
                    <Users size={16} />
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
                  <History size={20} />
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
              Discussion Topic *
            </label>
            <textarea
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
              placeholder="What would you like to discuss?"
              autoFocus
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
              disabled={!newTopicContent.trim() || isSubmitting}
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: !newTopicContent.trim() || isSubmitting ? undefined : '#005596' }}
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
        title="Time's Up! Vote on Next Action"
        showCloseButton={false}
      >
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
        {userVote && (
          <p className="text-sm text-gray-600 text-center mt-4">
            Waiting for results...
          </p>
        )}
      </Modal>
    </div>
  );
}
