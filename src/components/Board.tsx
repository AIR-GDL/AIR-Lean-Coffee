'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, pointerWithin, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { User, TimerSettings, ColumnType } from '@/types';
import { useTopics } from '@/hooks/useTopics';
import { useUsers } from '@/hooks/useUsers';
import { usePusher } from '@/hooks/usePusher';
import { createTopic, updateTopic, deleteTopic, deleteUser } from '@/lib/api';
import Column from './Column';
import TopicCard from './TopicCard';
import Timer from './Timer';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { Square, Check } from 'lucide-react';
import { useGlobalLoader } from '@/context/LoaderContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EVENTS } from '@/lib/pusher-client';

interface BoardProps {
  user: User;
  onLogout: () => void;
  timerSettings: TimerSettings;
  setTimerSettings: (value: TimerSettings | ((val: TimerSettings) => TimerSettings)) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedParticipants: Set<string>;
  setSelectedParticipants: React.Dispatch<React.SetStateAction<Set<string>>>;
  isSelectMode: boolean;
  setIsSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
  showDeleteParticipantsModal: boolean;
  setShowDeleteParticipantsModal: React.Dispatch<React.SetStateAction<boolean>>;
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

export default function Board({ 
  user: initialUser, 
  onLogout, 
  timerSettings, 
  setTimerSettings,
  setUser,
  selectedParticipants,
  setSelectedParticipants,
  isSelectMode,
  setIsSelectMode,
  showDeleteParticipantsModal,
  setShowDeleteParticipantsModal,
}: BoardProps) {
  const router = useRouter();
  const { topics, isLoading, mutate } = useTopics();
  const { users, mutate: mutateUsers } = useUsers();
  const { showLoader, hideLoader } = useGlobalLoader();
  const [user, setLocalUser] = useState<User>(initialUser);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showConfirmDiscussModal, setShowConfirmDiscussModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [pendingTopicMove, setPendingTopicMove] = useState<{ topicId: string } | null>(null);
  const [userVote, setUserVote] = useState<'finish' | 'continue' | null>(null);
  const [showAddTimeSlider, setShowAddTimeSlider] = useState(false);
  const [additionalMinutes, setAdditionalMinutes] = useState(5);
  const [showAdminTimerChoice, setShowAdminTimerChoice] = useState(false);
  const [voteResults, setVoteResults] = useState<{ finish: string[]; continue: string[] }>({ finish: [], continue: [] });
  const [isVotingActive, setIsVotingActive] = useState(false);

  const isAdmin = user.roles?.includes('admin');
  
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track if timer has been restored to avoid infinite loops
  const timerRestoredRef = useRef(false);

  // Helper to broadcast Pusher events via API
  const broadcastEvent = useCallback(async (eventName: string, data: Record<string, unknown>) => {
    try {
      await fetch('/api/pusher/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, data }),
      });
    } catch (error) {
      console.error('Failed to broadcast event:', error);
    }
  }, []);

  // Pusher real-time subscriptions
  usePusher({
    onTopicCreated: () => mutate(),
    onTopicUpdated: () => mutate(),
    onTopicDeleted: () => mutate(),
    onUserUpdated: () => mutateUsers(),
    onUserDeleted: () => mutateUsers(),
    onDiscussionStarted: (data) => {
      // When another user starts a discussion, sync the timer
      const now = Date.now();
      const elapsedMs = now - data.startTime;
      const totalMs = data.durationMinutes * 60 * 1000;
      const remainingMs = Math.max(0, totalMs - elapsedMs);
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      if (remainingMs > 0) {
        setTimerSettings({
          durationMinutes: data.durationMinutes,
          isRunning: true,
          isPaused: false,
          startTime: data.startTime,
          remainingSeconds,
          pausedRemainingSeconds: null,
          currentTopicId: data.topicId,
        });
      }
      mutate();
    },
    onDiscussionFinished: () => {
      // Reset timer and close voting modal for all users
      setTimerSettings({
        ...timerSettings,
        isRunning: false,
        startTime: null,
        remainingSeconds: null,
        currentTopicId: null,
        isPaused: false,
        pausedRemainingSeconds: null,
      });
      setShowVotingModal(false);
      setShowAdminTimerChoice(false);
      setIsVotingActive(false);
      setUserVote(null);
      setShowAddTimeSlider(false);
      setVoteResults({ finish: [], continue: [] });
      mutate();
      mutateUsers();
    },
    onTimeAdded: (data) => {
      // Sync added time across all clients
      setTimerSettings({
        ...timerSettings,
        isRunning: true,
        isPaused: false,
        startTime: data.newStartTime,
        remainingSeconds: data.additionalSeconds,
        pausedRemainingSeconds: null,
        currentTopicId: data.topicId,
      });
      setShowVotingModal(false);
      setShowAdminTimerChoice(false);
      setIsVotingActive(false);
      setShowAddTimeSlider(false);
      setUserVote(null);
      setVoteResults({ finish: [], continue: [] });
    },
    onVotingStarted: (data) => {
      // When voting is started (by admin), show voting modal for all users
      if (data.reason === 'timer-expired') {
        setTimerSettings({
          ...timerSettings,
          isRunning: false,
          isPaused: true,
          pausedRemainingSeconds: 0,
        });
      }
      setVoteResults({ finish: [], continue: [] });
      setIsVotingActive(true);
      setShowAdminTimerChoice(false);
      setShowVotingModal(true);
      setUserVote(null);
      setShowAddTimeSlider(false);
    },
    onVoteCast: (data) => {
      // Update live vote counts
      setVoteResults((prev) => {
        const newResults = { ...prev };
        // Remove from both lists first (in case of re-vote)
        newResults.finish = newResults.finish.filter((e) => e !== data.voterEmail);
        newResults.continue = newResults.continue.filter((e) => e !== data.voterEmail);
        // Add to the voted list
        if (data.vote === 'finish') {
          newResults.finish = [...newResults.finish, data.voterEmail];
        } else {
          newResults.continue = [...newResults.continue, data.voterEmail];
        }
        return newResults;
      });
    },
    onVotingResolved: (data) => {
      if (data.result === 'finish') {
        // Reset timer and close modal
        setTimerSettings({
          ...timerSettings,
          isRunning: false,
          startTime: null,
          remainingSeconds: null,
          currentTopicId: null,
          isPaused: false,
          pausedRemainingSeconds: null,
        });
        setShowVotingModal(false);
        setShowAdminTimerChoice(false);
        setIsVotingActive(false);
        setUserVote(null);
        setShowAddTimeSlider(false);
        setVoteResults({ finish: [], continue: [] });
        mutate();
        mutateUsers();
        // Confetti for everyone
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 100);
      }
      // 'continue' with time added is handled by onTimeAdded
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Show loader when loading board
  useEffect(() => {
    if (isLoading) {
      showLoader('Loading board...');
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  // Update user in state when initialUser changes
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Update current user when users list changes (vote returns)
  // Also check if user still exists (wasn't deleted by another session)
  useEffect(() => {
    if (user && users.length > 0) {
      const updatedUser = users.find(u => u.email === user.email);
      
      // If user was deleted by another session, redirect to register
      if (!updatedUser) {
        console.warn('User was deleted from another session');
        router.push('/');
        return;
      }
      
      const rolesChanged = JSON.stringify(updatedUser.roles) !== JSON.stringify(user.roles);
      const votesChanged = updatedUser.votesRemaining !== user.votesRemaining;
      if (rolesChanged || votesChanged) {
        setUser(updatedUser);
        setLocalUser(updatedUser);
        // Also update sessionStorage
        sessionStorage.setItem('lean-coffee-user', JSON.stringify(updatedUser));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  // Restore timer if a topic is currently being discussed
  useEffect(() => {
    if (isLoading || topics.length === 0) {
      timerRestoredRef.current = false;
      return;
    }

    const discussingTopic = topics.find(t => t.status === 'discussing');

    // Only restore timer once per discussing topic
    if (timerRestoredRef.current && timerSettings.currentTopicId === discussingTopic?._id) {
      return;
    }

    if (!discussingTopic || !discussingTopic.discussionStartTime || !discussingTopic.discussionDurationMinutes) {
      // If there's no discussing topic or missing data, reset timer only once
      if (!timerRestoredRef.current) {
        setTimerSettings({
          durationMinutes: 5,
          isRunning: false,
          startTime: null,
          remainingSeconds: null,
          currentTopicId: null,
          isPaused: false,
          pausedRemainingSeconds: null,
        });
        timerRestoredRef.current = true;
      }
      return;
    }

    const now = Date.now();
    const totalMs = discussingTopic.discussionDurationMinutes * 60 * 1000;
    const elapsedMs = now - discussingTopic.discussionStartTime;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    if (remainingMs <= 0) {
      setTimerSettings({
        durationMinutes: discussingTopic.discussionDurationMinutes || 0,
        isRunning: false,
        isPaused: true,
        startTime: discussingTopic.discussionStartTime || null,
        remainingSeconds: 0,
        pausedRemainingSeconds: 0,
        currentTopicId: discussingTopic._id,
      });
    } else {
      setTimerSettings({
        durationMinutes: discussingTopic.discussionDurationMinutes || 0,
        isRunning: true,
        isPaused: false,
        startTime: now - elapsedMs,
        remainingSeconds,
        pausedRemainingSeconds: null,
        currentTopicId: discussingTopic._id,
      });
    }

    timerRestoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, topics]);

  const getTopicsByColumn = (columnId: ColumnType) => {
    const dbStatus = columnIdToStatus(columnId);
    return topics.filter(topic => topic.status === dbStatus && !topic.archived);
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
      hideLoader();
    }
  };

  const handleVote = async (topicId: string) => {
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
    } finally {
      hideLoader();
    }
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // Only admins can drag cards between columns
    if (!user.roles?.includes('admin')) return;

    // If no drop target detected, return early
    if (!over) return;

    const topicId = active.id as string;
    const targetColumnId = over.id as ColumnType;
    const topic = topics.find(t => t._id === topicId);

    // Validate topic exists and is not already in target column
    if (!topic || statusToColumnId(topic.status) === targetColumnId) return;

    // Only allow moving to "Discussing" from "Top Voted" section (to-discuss with votes)
    if (targetColumnId === 'discussing') {
      if (topic.status === 'to-discuss' && topic.votes > 0) {
        setPendingTopicMove({ topicId });
        setShowConfirmDiscussModal(true);
      }
      return;
    }

    // Allow moving between "discussing" and "discussed" columns
    if (targetColumnId === 'discussed') {
      if (topic.status === 'discussing') {
        // If timer is running, show voting modal (finish early)
        if (timerSettings.isRunning && timerSettings.currentTopicId === topicId) {
          // Calculate current remaining time
          const elapsedMs = Date.now() - (timerSettings.startTime || 0);
          const totalMs = timerSettings.durationMinutes * 60 * 1000;
          const remainingMs = Math.max(0, totalMs - elapsedMs);
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          
          // Pause timer temporarily with calculated remaining time
          setTimerSettings({
            ...timerSettings,
            isPaused: true,
            pausedRemainingSeconds: remainingSeconds,
            remainingSeconds: remainingSeconds,
          });
          // Broadcast voting-started to all clients
          broadcastEvent(EVENTS.VOTING_STARTED, {
            topicId,
            triggeredBy: user.email,
            reason: 'finish-early',
          });
        } else {
          // Allow moving from discussing to discussed (manual move)
          handleMoveToDiscussed(topicId);
        }
      }
      return;
    }

    // Prevent moving to other columns inappropriately
    if (targetColumnId === 'toDiscuss' || targetColumnId === 'actions') {
      return;
    }
  };

  const handleMoveToDiscussed = async (topicId: string) => {
    try {
      const topic = topics.find(t => t._id === topicId);
      if (!topic) return;

      // Calculate elapsed time if topic is currently being discussed
      let totalTime = topic.totalTimeDiscussed || 0;
      if (topic.status === 'discussing' && timerSettings.startTime) {
        const elapsedSeconds = Math.floor((Date.now() - timerSettings.startTime) / 1000);
        totalTime += elapsedSeconds;
      }

      await updateTopic(topicId, {
        status: 'discussed',
        totalTimeDiscussed: totalTime,
      });

      await mutate(); // Refresh topics
    } catch (error) {
      console.error('Failed to move topic to discussed:', error);
      alert('Failed to move topic. Please try again.');
    } finally {
      hideLoader();
    }
  };

  const handleToggleParticipantSelection = (userId: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedParticipants(newSelected);
  };

  const handleDeleteParticipants = async () => {
    if (selectedParticipants.size === 0) return;

    try {
      // Delete each selected participant
      for (const userId of selectedParticipants) {
        await deleteUser(userId);
      }

      // Refresh users list
      await mutateUsers();
      
      // Clear selection and exit select mode
      setSelectedParticipants(new Set());
      setShowDeleteParticipantsModal(false);
      setIsSelectMode(false);
    } catch (error) {
      console.error('Failed to delete participants:', error);
      alert('Failed to delete participants. Please try again.');
    } finally {
      hideLoader();
    }
  };

  const handleConfirmDiscuss = async () => {
    if (!pendingTopicMove) return;

    const { topicId } = pendingTopicMove;
    const now = Date.now();
    
    try {
      await updateTopic(topicId, {
        status: 'discussing',
        discussionStartTime: now,
        discussionDurationMinutes: timerSettings.durationMinutes,
      });

      // Start timer
      setTimerSettings({
        ...timerSettings,
        isRunning: true,
        startTime: now,
        remainingSeconds: timerSettings.durationMinutes * 60,
        currentTopicId: topicId,
      });

      await mutate(); // Refresh topics
      setShowConfirmDiscussModal(false);
      setPendingTopicMove(null);
    } catch (error) {
      console.error('Failed to update topic status:', error);
      alert('Failed to start discussion. Please try again.');
    } finally {
      hideLoader();
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

    if (isAdmin) {
      // Admin sees choice: finish topic directly or start a voting round
      setShowAdminTimerChoice(true);
    } else {
      // Non-admins see waiting message (admin will decide)
      setShowVotingModal(true);
      setIsVotingActive(false);
      setUserVote(null);
    }
  };

  const handleAdminFinishTopic = async () => {
    const currentTopicId = timerSettings.currentTopicId;
    if (currentTopicId && timerSettings.startTime) {
      try {
        const elapsedSeconds = Math.floor((Date.now() - timerSettings.startTime) / 1000);
        const currentTopic = topics.find(t => t._id === currentTopicId);
        const totalTime = (currentTopic?.totalTimeDiscussed || 0) + elapsedSeconds;

        await updateTopic(currentTopicId, {
          status: 'discussed',
          totalTimeDiscussed: totalTime,
        });

        await broadcastEvent(EVENTS.VOTING_RESOLVED, {
          topicId: currentTopicId,
          result: 'finish',
          resolvedBy: user.email,
        });
      } catch (error) {
        console.error('Failed to finish topic:', error);
      } finally {
        hideLoader();
      }
    }
    setShowAdminTimerChoice(false);
  };

  const handleAdminStartVoting = () => {
    setShowAdminTimerChoice(false);
    // Broadcast voting-started to all clients (including self)
    broadcastEvent(EVENTS.VOTING_STARTED, {
      topicId: timerSettings.currentTopicId,
      triggeredBy: user.email,
      reason: 'timer-expired',
    });
  };

  const handleVoteSubmit = async (vote: 'finish' | 'continue') => {
    setUserVote(vote);

    // Broadcast this user's vote to all clients
    broadcastEvent(EVENTS.VOTE_CAST, {
      topicId: timerSettings.currentTopicId,
      voterEmail: user.email,
      vote,
    });
  };

  const handleAdminResolveVote = async (resolution: 'finish' | 'continue') => {
    if (resolution === 'finish') {
      const currentTopicId = timerSettings.currentTopicId;
      if (currentTopicId && timerSettings.startTime) {
        try {
          const elapsedSeconds = Math.floor((Date.now() - timerSettings.startTime) / 1000);
          const currentTopic = topics.find(t => t._id === currentTopicId);
          const totalTime = (currentTopic?.totalTimeDiscussed || 0) + elapsedSeconds;

          await updateTopic(currentTopicId, {
            status: 'discussed',
            totalTimeDiscussed: totalTime,
          });

          await broadcastEvent(EVENTS.VOTING_RESOLVED, {
            topicId: currentTopicId,
            result: 'finish',
            resolvedBy: user.email,
          });
        } catch (error) {
          console.error('Failed to finish topic:', error);
        } finally {
          hideLoader();
        }
      }
    } else {
      // Continue - show add time slider for admin
      setShowAddTimeSlider(true);
    }
  };

  const handleAddTimeConfirm = () => {
    const newStartTime = Date.now();
    const additionalSeconds = additionalMinutes * 60;
    
    // Update local timer
    setTimerSettings({
      ...timerSettings,
      isRunning: true,
      isPaused: false,
      startTime: newStartTime,
      remainingSeconds: additionalSeconds,
      pausedRemainingSeconds: null,
    });
    setShowAddTimeSlider(false);
    setShowVotingModal(false);
    setShowAdminTimerChoice(false);
    setIsVotingActive(false);
    setUserVote(null);
    setVoteResults({ finish: [], continue: [] });

    // Broadcast time-added to all clients
    broadcastEvent(EVENTS.TIME_ADDED, {
      topicId: timerSettings.currentTopicId,
      additionalSeconds,
      newStartTime,
    });
  };

  const handleFinishEarly = () => {
    // Pause the timer and store current remaining time
    setTimerSettings({
      ...timerSettings,
      isRunning: false,
      isPaused: true,
      pausedRemainingSeconds: timerSettings.remainingSeconds,
    });
    // Broadcast voting-started to all clients
    broadcastEvent(EVENTS.VOTING_STARTED, {
      topicId: timerSettings.currentTopicId,
      triggeredBy: user.email,
      reason: 'finish-early',
    });
  };

  const handleLogout = () => {
    onLogout();
  };

  const activeTopic = activeId ? topics.find(t => t._id === activeId) : null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header with Sidebar Trigger */}
      <header className="flex-shrink-0 bg-background sticky top-0 flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Lean Coffee Board</h1>
      </header>

      {/* Timer Display */}
      {timerSettings.isRunning && timerSettings.remainingSeconds !== null && (
        <div className="flex-shrink-0 w-full px-4 py-4 bg-background border-b">
          <div className="space-y-4">
            <Timer
              remainingSeconds={timerSettings.remainingSeconds}
              onTimeUp={handleTimerComplete}
            />
            {/* Active Topic Display */}
            {timerSettings.currentTopicId && (() => {
              const currentTopic = topics.find(t => t._id === timerSettings.currentTopicId);
              return currentTopic ? (
                <div className="bg-card rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: '#005596' }}>
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-foreground mb-3 truncate break-words">{currentTopic.title}</h2>
                      {currentTopic.description && (
                        <p className="text-muted-foreground whitespace-pre-wrap break-words line-clamp-3">{currentTopic.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-3 truncate">by {currentTopic.author}</p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleFinishEarly}
                className="border-2 border-[#005596] text-[#005596] hover:bg-[#005596]/10 font-semibold shadow-md"
                size="lg"
              >
                <Square className="h-5 w-5" />
                Finish Early
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <main className="flex-1 overflow-auto min-h-0 p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full w-full">
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
      <Dialog open={showAddTopicModal} onOpenChange={setShowAddTopicModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Title *</Label>
              <Input
                id="topic-title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Enter topic title"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-description">Description</Label>
              <Textarea
                id="topic-description"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                placeholder="Add additional details (optional)"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddTopicModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTopic}
              disabled={!newTopicTitle.trim() || isSubmitting}
              className="bg-[#005596] hover:bg-[#004478] text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Topic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Discuss Modal */}
      <AlertDialog open={showConfirmDiscussModal} onOpenChange={(open) => {
        if (!open) {
          setShowConfirmDiscussModal(false);
          setPendingTopicMove(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Discussion?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start discussing this topic?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDiscussModal(false);
              setPendingTopicMove(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscuss}
              className="bg-[#005596] hover:bg-[#004478]"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Timer Choice Modal - only admin sees this when timer expires */}
      <Dialog open={showAdminTimerChoice} onOpenChange={(open) => {
        if (!open) setShowAdminTimerChoice(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"Time's Up!"}</DialogTitle>
          </DialogHeader>
          {showAddTimeSlider ? (
            <div className="space-y-4 py-2">
              <p className="text-muted-foreground">Select additional time to continue the discussion:</p>
              <div className="space-y-2">
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[additionalMinutes]}
                  onValueChange={(value) => setAdditionalMinutes(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 min</span>
                  <span className="font-bold text-lg text-[#005596]">{additionalMinutes} minutes</span>
                  <span>20 min</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddTimeSlider(false)}>
                  Back
                </Button>
                <Button
                  onClick={handleAddTimeConfirm}
                  className="bg-[#005596] hover:bg-[#004478] text-white"
                >
                  Add Time &amp; Continue
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-muted-foreground">What would you like to do?</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleAdminFinishTopic}
                  className="w-full font-semibold bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600"
                  variant="outline"
                  size="lg"
                >
                  Finish Topic
                </Button>
                <Button
                  onClick={handleAdminStartVoting}
                  className="w-full font-semibold bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  variant="outline"
                  size="lg"
                >
                  Start Voting
                </Button>
                <Button
                  onClick={() => {
                    setAdditionalMinutes(timerSettings.durationMinutes);
                    setShowAddTimeSlider(true);
                  }}
                  className="w-full font-semibold bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600"
                  variant="outline"
                  size="lg"
                >
                  Add More Time
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Voting Modal - all users see this when voting is active */}
      <Dialog open={showVotingModal} onOpenChange={(open) => {
        if (!open && !isVotingActive) {
          setShowVotingModal(false);
          setUserVote(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showAddTimeSlider ? 'Add More Time' : (isVotingActive ? 'Vote on Next Action' : "Time's Up!")}
            </DialogTitle>
          </DialogHeader>
          {showAddTimeSlider && isAdmin ? (
            <div className="space-y-4 py-2">
              <p className="text-muted-foreground">Select additional time to continue the discussion:</p>
              <div className="space-y-2">
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[additionalMinutes]}
                  onValueChange={(value) => setAdditionalMinutes(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 min</span>
                  <span className="font-bold text-lg text-[#005596]">{additionalMinutes} minutes</span>
                  <span>20 min</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddTimeSlider(false)}>
                  Back
                </Button>
                <Button
                  onClick={handleAddTimeConfirm}
                  className="bg-[#005596] hover:bg-[#004478] text-white"
                >
                  Add Time &amp; Continue
                </Button>
              </DialogFooter>
            </div>
          ) : isVotingActive ? (
            <div className="space-y-4 py-2">
              <p className="text-muted-foreground">Should we finish this topic or continue the discussion?</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleVoteSubmit('finish')}
                  disabled={userVote !== null}
                  variant={userVote === 'finish' ? 'default' : 'outline'}
                  className={`w-full font-semibold ${
                    userVote === 'finish'
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600'
                  }`}
                  size="lg"
                >
                  {userVote === 'finish' && <Check className="h-5 w-5" />}
                  Finish Topic
                  <Badge variant="secondary" className="ml-2">{voteResults.finish.length}</Badge>
                </Button>
                <Button
                  onClick={() => handleVoteSubmit('continue')}
                  disabled={userVote !== null}
                  variant={userVote === 'continue' ? 'default' : 'outline'}
                  className={`w-full font-semibold ${
                    userVote === 'continue'
                      ? 'bg-blue-600 hover:bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                  }`}
                  size="lg"
                >
                  {userVote === 'continue' && <Check className="h-5 w-5" />}
                  Continue Discussion
                  <Badge variant="secondary" className="ml-2">{voteResults.continue.length}</Badge>
                </Button>
              </div>

              {/* Admin resolution controls */}
              {isAdmin && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin Decision</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAdminResolveVote('finish')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Resolve: Finish
                    </Button>
                    <Button
                      onClick={() => {
                        setAdditionalMinutes(timerSettings.durationMinutes);
                        handleAdminResolveVote('continue');
                      }}
                      className="flex-1 bg-[#005596] hover:bg-[#004478] text-white"
                      size="sm"
                    >
                      Resolve: Add Time
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="animate-pulse text-muted-foreground text-center">
                <p className="text-lg font-medium">Waiting for admin decision...</p>
                <p className="text-sm mt-1">The admin will decide whether to finish or start a vote.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Participants Modal */}
      <AlertDialog open={showDeleteParticipantsModal} onOpenChange={setShowDeleteParticipantsModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Participants?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedParticipants.size} participant{selectedParticipants.size !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteParticipants}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
