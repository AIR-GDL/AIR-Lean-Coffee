'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, pointerWithin, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { User, TimerSettings, ColumnType } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTopics } from '@/hooks/useTopics';
import { useUsers } from '@/hooks/useUsers';
import { createTopic, updateTopic, deleteTopic, deleteUser } from '@/lib/api';
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
import CheckIcon from './icons/CheckIcon';
import DeleteIcon from './icons/DeleteIcon';
import MaterialSymbol from './icons/MaterialSymbol';
import ShieldIcon from './icons/ShieldIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import EqualIcon from './icons/EqualIcon';
import SettingsIcon from './icons/SettingsIcon';
import FeedbackMenu from './FeedbackMenu';
import BugReportModal from './BugReportModal';
import ChangelogModal from './ChangelogModal';
import AppHeader from './AppHeader';
import SettingsView from './SettingsView';
import { useGlobalLoader } from '@/context/LoaderContext';
import { usePusherTopics, triggerTopicEvent } from '@/hooks/usePusherTopics';
import { usePusherUsers, triggerUserEvent } from '@/hooks/usePusherUsers';
import { usePusherTimer, triggerTimerEvent } from '@/hooks/usePusherTimer';
import { useIsAdmin } from '@/hooks/useIsAdmin';

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
  const { showLoader, hideLoader } = useGlobalLoader();
  
  // Generate unique room ID based on hostname and timestamp
  // This ensures different browser tabs/sessions have separate rooms
  const [roomId] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '/';
      return `room${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    }
    return 'room-default';
  });
  
  const [user, setUser] = useState<User>(initialUser);
  const isAdmin = useIsAdmin(user);
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
  const [userVote, setUserVote] = useState<'finish' | 'continue' | 'against' | 'neutral' | 'favor' | null>(null);
  const [showAddTimeSlider, setShowAddTimeSlider] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [voteCount, setVoteCount] = useState({ against: 0, neutral: 0, favor: 0 });
  const [additionalMinutes, setAdditionalMinutes] = useState(5);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [hoveredVote, setHoveredVote] = useState<'against' | 'neutral' | 'favor' | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [showDeleteParticipantsModal, setShowDeleteParticipantsModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showSettingsView, setShowSettingsView] = useState(false);
  
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track if timer has been restored to avoid infinite loops
  const timerRestoredRef = useRef(false);
  const durationUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const sendUserLeftEvent = useCallback((userId: string | undefined) => {
    if (!userId) return;

    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const payload = JSON.stringify({
          event: 'user-left',
          data: { userId },
          channel: `users-${roomId}`,
        });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/pusher/users', blob);
      } else {
        void triggerUserEvent('user-left', { userId }, roomId);
      }
    } catch (error) {
      console.error('Failed to send user-left beacon:', error);
      void triggerUserEvent('user-left', { userId }, roomId);
    }
  }, [roomId]);

  // Trigger user-joined event when user loads and user-left when unmounts
  useEffect(() => {
    if (initialUser?._id) {
      triggerUserEvent('user-joined', { user: initialUser, requestSync: true }, roomId);
      triggerUserEvent('user-online', { user: initialUser }, roomId);

      const handleBeforeUnload = () => {
        sendUserLeftEvent(initialUser._id);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // Cleanup: trigger user-left when component unmounts
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        sendUserLeftEvent(initialUser._id);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(initialUser._id);
          return newSet;
        });
      };
    }
  }, [initialUser?._id, sendUserLeftEvent, roomId]);

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
      
      // Update if votes or roles changed
      if (updatedUser.votesRemaining !== user.votesRemaining || 
          JSON.stringify(updatedUser.roles) !== JSON.stringify(user.roles)) {
        setUser(updatedUser);
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
    // Convert ISO string to timestamp
    const startTime = discussingTopic.discussionStartTime ? new Date(discussingTopic.discussionStartTime).getTime() : now;
    const durationMinutes = Number(discussingTopic.discussionDurationMinutes);
    const totalMs = durationMinutes * 60 * 1000;
    const elapsedMs = now - startTime;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    if (remainingMs <= 0) {
      setTimerSettings({
        durationMinutes: discussingTopic.discussionDurationMinutes || 0,
        isRunning: false,
        isPaused: true,
        startTime,
        remainingSeconds: 0,
        pausedRemainingSeconds: 0,
        currentTopicId: discussingTopic._id,
      });
      setTimerExpired(true);
      setShowVotingModal(true);
      setShowAddTimeSlider(false);
      setUserVote(null);
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

  // Subscribe to Pusher timer events for real-time synchronization
  usePusherTimer({
    onTimerUpdated: (timerData) => {
      const now = Date.now();
      const startTime = timerData.startTime ?? now;
      const durationMinutes = timerData.durationMinutes ?? 5;
      const totalMs = durationMinutes * 60 * 1000;
      const elapsedMs = now - startTime;
      const remainingMs = Math.max(0, totalMs - elapsedMs);
      const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

      setTimerSettings({
        durationMinutes,
        isRunning: true,
        startTime,
        remainingSeconds,
        currentTopicId: timerData.topicId ?? null,
        isPaused: false,
        pausedRemainingSeconds: null,
      });

      setShowVotingModal(false);
      setShowAddTimeSlider(false);
      setUserVote(null);
      setVoteCount({ against: 0, neutral: 0, favor: 0 });
      setTimerExpired(false);
    },
    onTimerStarted: (timerData) => {
      const now = Date.now();
      const startTime = timerData.startTime ?? now;
      const durationMinutes = timerData.durationMinutes ?? 5;
      const totalMs = durationMinutes * 60 * 1000;
      const elapsedMs = now - startTime;
      const remainingMs = Math.max(0, totalMs - elapsedMs);
      const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

      setTimerSettings({
        durationMinutes,
        isRunning: true,
        startTime,
        remainingSeconds,
        currentTopicId: timerData.topicId ?? null,
        isPaused: false,
        pausedRemainingSeconds: null,
      });

      setShowVotingModal(false);
      setShowAddTimeSlider(false);
      setUserVote(null);
      setVoteCount({ against: 0, neutral: 0, favor: 0 });
      setTimerExpired(false);
    },
    onTimerPaused: (timerData) => {
      setTimerSettings({
        durationMinutes: timerData.durationMinutes || 5,
        isRunning: false,
        isPaused: true,
        pausedRemainingSeconds: timerData.remainingSeconds || 0,
        startTime: null,
        remainingSeconds: timerData.remainingSeconds || 0,
        currentTopicId: timerData.topicId,
      });

      setShowVotingModal(false);
      setShowAddTimeSlider(false);
      setUserVote(null);
      setVoteCount({ against: 0, neutral: 0, favor: 0 });
      setTimerExpired(false);
    },
    onTimerStopped: () => {
      setTimerSettings({
        durationMinutes: 5,
        isRunning: false,
        startTime: null,
        remainingSeconds: null,
        currentTopicId: null,
        isPaused: false,
        pausedRemainingSeconds: null,
      });

      setShowVotingModal(false);
      setShowAddTimeSlider(false);
      setUserVote(null);
      setVoteCount({ against: 0, neutral: 0, favor: 0 });
      setTimerExpired(false);
    },
    onDurationChanged: (durationMinutes) => {
      setTimerSettings(prev => ({
        ...prev,
        durationMinutes,
      }));

      setShowVotingModal(false);
      setShowAddTimeSlider(false);
      setUserVote(null);
      setVoteCount({ against: 0, neutral: 0, favor: 0 });
      setTimerExpired(false);
    },
  });

  // Subscribe to Pusher user events for online status
  usePusherUsers({
    roomId,
    onUserJoined: ({ user: joinedUser, requestSync }) => {
      setOnlineUsers(prev => new Set([...prev, joinedUser._id]));

      if (requestSync && user?._id && user._id !== joinedUser._id) {
        triggerUserEvent('user-online', { user }, roomId);
      }
    },
    onUserOnline: (onlineUser) => {
      setOnlineUsers(prev => new Set([...prev, onlineUser._id]));
    },
    onUserLeft: (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
    onUserUpdated: (updatedUser) => {
      if (updatedUser._id === user?._id) {
        setUser(updatedUser);
      }
    },
    onVotesUpdated: (userId, votesRemaining) => {
      if (userId === user?._id) {
        setUser(prev => ({ ...prev, votesRemaining }));
      }
    },
    onVoteCast: ({ voteCount }) => {
      setVoteCount(voteCount);
    },
  });

  // Mark current user as online on mount
  useEffect(() => {
    if (user?._id) {
      setOnlineUsers(prev => new Set([...prev, user._id]));
    }
  }, [user?._id]);

  // Sort users: online first (admins then users), then offline (admins then users)
  const sortedUsers = useMemo(() => {
    console.log('sortedUsers recalculated, onlineUsers size:', onlineUsers.size, 'users length:', users.length);
    return [...users].sort((a, b) => {
      // Online users first
      const aIsOnline = onlineUsers.has(a._id) ? 1 : 0;
      const bIsOnline = onlineUsers.has(b._id) ? 1 : 0;
      if (aIsOnline !== bIsOnline) return bIsOnline - aIsOnline;

      // Then admins within each group (online/offline)
      const aIsAdmin = a.roles?.includes('admin') ? 1 : 0;
      const bIsAdmin = b.roles?.includes('admin') ? 1 : 0;
      if (aIsAdmin !== bIsAdmin) return bIsAdmin - aIsAdmin;

      // Then by name
      return a.name.localeCompare(b.name);
    });
  }, [users, onlineUsers]);

  const getTopicsByColumn = (columnId: ColumnType) => {
    const dbStatus = columnIdToStatus(columnId);
    return topics.filter(topic => topic.status === dbStatus && !topic.archived);
  };

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTopic = await createTopic({
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim(),
        author: user.name,
      });
      
      // Trigger Pusher event
      await triggerTopicEvent('topic-created', { topic: newTopic });
      
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
    try {
      const response = await updateTopic(topicId, {
        action: 'VOTE',
        userEmail: user.email,
      });

      // Update local user state with new votes remaining
      if ('user' in response) {
        setUser(response.user);
        await triggerUserEvent('votes-updated', {
          userId: user._id,
          votesRemaining: response.user.votesRemaining,
        });
      }

      // Trigger Pusher event for topic update
      const updatedTopic = await updateTopic(topicId, {});
      await triggerTopicEvent('topic-updated', { topic: updatedTopic });

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

    // If no drop target detected, return early
    if (!over) return;

    const topicId = active.id as string;
    const targetColumnId = over.id as ColumnType;
    const topic = topics.find(t => t._id === topicId);

    // Validate topic exists and is not already in target column
    if (!topic || statusToColumnId(topic.status) === targetColumnId) return;

    if (!isAdmin && (targetColumnId === 'discussing' || targetColumnId === 'discussed')) {
      return;
    }

    // Only allow moving to "Discussing" from "Top Voted" section (to-discuss with votes)
    if (targetColumnId === 'discussing') {
      if (!isAdmin) return;
      if (topic.status === 'to-discuss' && topic.votes > 0) {
        setPendingTopicMove({ topicId });
        setShowConfirmDiscussModal(true);
      }
      return;
    }

    // Allow moving between "discussing" and "discussed" columns
    if (targetColumnId === 'discussed') {
      if (!isAdmin) return;
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
          // Show voting modal
          setShowVotingModal(true);
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

      const updatedTopic = await updateTopic(topicId, {
        status: 'discussed',
        totalTimeDiscussed: totalTime,
      });

      // Trigger Pusher event
      await triggerTopicEvent('topic-status-changed', {
        topicId,
        status: 'discussed',
      });

      await mutate(); // Refresh topics
    } catch (error) {
      console.error('Failed to move topic to discussed:', error);
      alert('Failed to move topic. Please try again.');
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
        await triggerUserEvent('user-left', { userId }, roomId);
        await triggerUserEvent('user-updated', { user: { _id: userId } });
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
    }
  };

  const handleConfirmDiscuss = async () => {
    if (!pendingTopicMove) return;

    const { topicId } = pendingTopicMove;
    const now = new Date();
    const nowTimestamp = Date.now();
    
    try {
      const updatedTopic = await updateTopic(topicId, {
        status: 'discussing',
        discussionStartTime: now.toISOString(),
        discussionDurationMinutes: timerSettings.durationMinutes,
      });

      // Trigger Pusher events
      await triggerTopicEvent('topic-status-changed', {
        topicId,
        status: 'discussing',
      });
      await triggerTimerEvent('timer-started', {
        topicId,
        startTime: nowTimestamp,
        durationMinutes: timerSettings.durationMinutes,
      });

      // Start timer
      setTimerSettings({
        ...timerSettings,
        isRunning: true,
        startTime: nowTimestamp,
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

  const handleTimerComplete = useCallback(() => {
    // Show voting modal but keep timer state for potential "continue"
    // Store remaining seconds as 0 to indicate timer expired
    setTimerSettings((prev) => ({
      ...prev,
      pausedRemainingSeconds: 0,
    }));
    setTimerExpired(true);
    setShowVotingModal(true);
    setUserVote(null);
  }, []);

  // Sync online users when voting modal opens
  useEffect(() => {
    if (showVotingModal && timerExpired) {
      // Request sync from other users to get accurate online count
      triggerUserEvent('user-joined', { user, requestSync: true }, roomId);
    }
  }, [showVotingModal, timerExpired, user, roomId]);

  const handleVoteSubmit = async (vote: 'finish' | 'continue' | 'against' | 'neutral' | 'favor') => {
    setUserVote(vote);
    
    // Count votes when timer expired
    if (timerExpired && (vote === 'against' || vote === 'neutral' || vote === 'favor')) {
      const newVoteCount = {
        ...voteCount,
        [vote]: voteCount[vote as keyof typeof voteCount] + 1,
      };
      setVoteCount(newVoteCount);
      
      // Broadcast vote to other sessions
      if (user?._id) {
        triggerUserEvent('vote-cast', {
          userId: user._id,
          vote,
          voteCount: newVoteCount,
        }, roomId);
      }
    }
    
    // In a real app, this would collect votes from all users
    // For now, we'll simulate immediate action
    setTimeout(async () => {
      // Handle timer expired votes (against, neutral, favor)
      if (timerExpired && (vote === 'against' || vote === 'neutral' || vote === 'favor')) {
        if (vote === 'against') {
          // Move topic to discussed (don't continue)
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

              await triggerTopicEvent('topic-status-changed', {
                topicId: currentTopicId,
                status: 'discussed',
              });
              await triggerTimerEvent('timer-stopped', {
                topicId: currentTopicId,
              });

              await mutate();
              await mutateUsers();
            } catch (error) {
              console.error('Failed to finish topic:', error);
            }
          }

          setTimerSettings({
            ...timerSettings,
            isRunning: false,
            startTime: null,
            remainingSeconds: null,
            currentTopicId: null,
            isPaused: false,
            pausedRemainingSeconds: null,
          });
        } else if (vote === 'neutral') {
          // Neutral - just close modal and show add time slider
          setShowAddTimeSlider(true);
          hideLoader();
          return;
        } else if (vote === 'favor') {
          // Favor - show add time slider
          setShowAddTimeSlider(true);
          hideLoader();
          return;
        }
      } else if (vote === 'finish') {
        // Move topic to discussed
        const currentTopicId = timerSettings.currentTopicId;
        if (currentTopicId && timerSettings.startTime) {
          try {
            // Calculate elapsed time in seconds
            const elapsedSeconds = Math.floor((Date.now() - timerSettings.startTime) / 1000);
            
            // Get current topic to add to existing time
            const currentTopic = topics.find(t => t._id === currentTopicId);
            const totalTime = (currentTopic?.totalTimeDiscussed || 0) + elapsedSeconds;
            
            const updatedTopic = await updateTopic(currentTopicId, {
              status: 'discussed',
              totalTimeDiscussed: totalTime,
            });

            // Trigger Pusher events
            await triggerTopicEvent('topic-status-changed', {
              topicId: currentTopicId,
              status: 'discussed',
            });
            await triggerTimerEvent('timer-stopped', {
              topicId: currentTopicId,
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
            hideLoader();
            return; // Exit early, don't close modal
          } else {
            // User pressed "Finish Early" but wants to continue
            // Just resume the timer without recalculating
            setTimerSettings({
              ...timerSettings,
              isRunning: true,
              isPaused: false,
              pausedRemainingSeconds: null,
            });

            // Trigger Pusher event for timer resumed
            if (timerSettings.currentTopicId && timerSettings.startTime) {
              await triggerTimerEvent('timer-started', {
                topicId: timerSettings.currentTopicId,
                startTime: timerSettings.startTime,
                durationMinutes: timerSettings.durationMinutes,
              });
            }
          }
        }
      }

      // Close modal first
      setShowVotingModal(false);
      setUserVote(null);
      setShowAddTimeSlider(false);
      setTimerExpired(false);

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

  const handleAddTimeConfirm = async () => {
    const currentTopicId = timerSettings.currentTopicId;
    const newStartTime = Date.now();
    const newDurationMinutes = additionalMinutes;
    
    if (currentTopicId) {
      try {
        await updateTopic(currentTopicId, {
          discussionStartTime: new Date(newStartTime).toISOString(),
          discussionDurationMinutes: newDurationMinutes,
        });
        
        await triggerTimerEvent('timer-updated', {
          topicId: currentTopicId,
          startTime: newStartTime,
          durationMinutes: newDurationMinutes,
        });
      } catch (error) {
        console.error('Failed to add time:', error);
      }
    }
    
    setTimerSettings({
      ...timerSettings,
      isRunning: true,
      isPaused: false,
      startTime: newStartTime,
      remainingSeconds: newDurationMinutes * 60,
      pausedRemainingSeconds: null,
    });
    setShowAddTimeSlider(false);
    setShowVotingModal(false);
    setUserVote(null);
    setVoteCount({ against: 0, neutral: 0, favor: 0 });
    setTimerExpired(false);
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

  const handleDurationChange = useCallback((newDuration: number) => {
    setTimerSettings(prev => ({
      ...prev,
      durationMinutes: newDuration,
    }));

    if (isAdmin) {
      if (durationUpdateTimeoutRef.current) {
        clearTimeout(durationUpdateTimeoutRef.current);
      }

      durationUpdateTimeoutRef.current = setTimeout(() => {
        void triggerTimerEvent('duration-updated', {
          durationMinutes: newDuration,
        });
      }, 300);
    }
  }, [isAdmin, setTimerSettings]);

  useEffect(() => {
    return () => {
      if (durationUpdateTimeoutRef.current) {
        clearTimeout(durationUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handleAdminContinueDiscussion = async () => {
    // Admin decides to continue - save votes and show add time slider
    const currentTopicId = timerSettings.currentTopicId;
    if (currentTopicId) {
      try {
        await updateTopic(currentTopicId, {
          finalVotes: voteCount,
        });
      } catch (error) {
        console.error('Failed to save votes:', error);
      }
    }
    setShowAddTimeSlider(true);
  };

  const handleAdminFinishDiscussion = async () => {
    // Admin decides to finish - save votes and move to discussed
    const currentTopicId = timerSettings.currentTopicId;
    if (currentTopicId && timerSettings.startTime) {
      try {
        const ds = Math.floor((Date.now() - timerSettings.startTime) / 1000);
        const currentTopic = topics.find(t => t._id === currentTopicId);
        const totalTime = (currentTopic?.totalTimeDiscussed || 0) + ds;

        await updateTopic(currentTopicId, {
          status: 'discussed',
          totalTimeDiscussed: totalTime,
          finalVotes: voteCount,
        });

        await triggerTopicEvent('topic-status-changed', {
          topicId: currentTopicId,
          status: 'discussed',
        });
        await triggerTimerEvent('timer-stopped', {
          topicId: currentTopicId,
        });

        await mutate();
        await mutateUsers();
      } catch (error) {
        console.error('Failed to finish discussion:', error);
      }
    }

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
    setUserVote(null);
    setShowAddTimeSlider(false);
    setTimerExpired(false);
    setVoteCount({ against: 0, neutral: 0, favor: 0 });

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 100);
  };

  const handleLogout = () => {
    onLogout();
  };

  const activeTopic = activeId ? topics.find(t => t._id === activeId) : null;

  // Show settings view if requested
  if (showSettingsView) {
    return <SettingsView onBack={() => setShowSettingsView(false)} user={user} onLogout={onLogout} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50">
      <AppHeader user={user} onLogout={onLogout}>
        <FeedbackMenu
          onReportBug={() => setShowBugReportModal(true)}
          onViewChangelog={() => setShowChangelogModal(true)}
        />
        {isAdmin && (
          <button
            onClick={() => setShowSettingsView(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Settings"
          >
            <SettingsIcon size={24} color="currentColor" />
          </button>
        )}
      </AppHeader>

      {/* Timer Display */}
      {timerSettings.isRunning && timerSettings.remainingSeconds !== null && (
        <div className="flex-shrink-0 max-w-7xl mx-auto w-full px-4 py-6">
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
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 truncate break-words">{currentTopic.title}</h2>
                      {currentTopic.description && (
                        <p className="text-gray-700 whitespace-pre-wrap break-words line-clamp-3">{currentTopic.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-3 truncate">by {currentTopic.author}</p>
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
      <main className="flex-1 overflow-hidden min-h-0">
        <div className="h-full min-h-0 max-w-7xl mx-auto w-full px-4 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full w-full">
            <Column
              id="toDiscuss"
              title="To Discuss"
              topics={getTopicsByColumn('toDiscuss')}
              user={user}
              onVote={handleVote}
              onAddTopic={() => setShowAddTopicModal(true)}
              onUpdate={() => mutate()}
              onDelete={handleDeleteTopic}
              canManageDiscussions={isAdmin}
            />

            <Column
              id="discussing"
              title="Discussing"
              topics={getTopicsByColumn('discussing')}
              user={user}
              onVote={handleVote}
              onUpdate={() => mutate()}
              onDelete={handleDeleteTopic}
              canManageDiscussions={isAdmin}
            />

            <Column
              id="discussed"
              title="Discussed"
              topics={getTopicsByColumn('discussed')}
              user={user}
              onVote={handleVote}
              onUpdate={() => mutate()}
              onDelete={handleDeleteTopic}
              canManageDiscussions={isAdmin}
            />

            <Column
              id="actions"
              title="Controls & Info"
              topics={[]}
              user={user}
              onVote={handleVote}
              onAddTopic={() => router.push('/history')}
              buttonLabel="Discussion History"
              buttonIcon={<HistoryIcon size={20} />}
              canManageDiscussions={isAdmin}
            >
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Discussion Duration */}
                <div className="flex-shrink-0">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon size={16} />
                    Discussion Duration
                  </label>
                  {isAdmin ? (
                    <>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={timerSettings.durationMinutes}
                        onChange={(e) => handleDurationChange(parseInt(e.target.value, 10))}
                        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none ${timerSettings.isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ accentColor: '#005596' }}
                        disabled={timerSettings.isRunning}
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>1 min</span>
                        <span className="font-bold" style={{ color: '#005596' }}>{timerSettings.durationMinutes} min</span>
                        <span>20 min</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-center">
                      <span className="inline-flex items-center justify-center px-4 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full w-full">
                        {timerSettings.durationMinutes} minute{timerSettings.durationMinutes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Participants with scroll */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <PeopleIcon size={16} />
                      Participants
                    </label>
                    {isSelectMode && (
                      selectedParticipants.size > 0 ? (
                        <button
                          onClick={() => setShowDeleteParticipantsModal(true)}
                          className="p-1 hover:bg-red-100 rounded transition text-red-600"
                          title="Delete selected participants"
                        >
                          <DeleteIcon size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsSelectMode(false)}
                          className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition"
                        >
                          Cancel
                        </button>
                      )
                    )}
                    {!isSelectMode && (
                      <button
                        onClick={() => setIsSelectMode(true)}
                        className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition"
                      >
                        Select
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                    {sortedUsers.map((participant) => (
                      <div
                        key={participant._id}
                        className={`flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-200 min-w-0 flex-shrink-0 transition ${
                          isSelectMode ? 'hover:bg-gray-50 cursor-pointer' : ''
                        }`}
                        onClick={() => isSelectMode && handleToggleParticipantSelection(participant._id)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {isSelectMode && (
                            <input
                              type="checkbox"
                              checked={selectedParticipants.has(participant._id)}
                              onChange={() => handleToggleParticipantSelection(participant._id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                          )}
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            {/* Online Status Indicator */}
                            {onlineUsers.has(participant._id) ? (
                              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse" title="Online"></div>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" title="Offline"></div>
                            )}
                            <span className="font-medium text-gray-700 truncate">{participant.name}</span>
                            {/* Admin Badge - Only show if user is admin */}
                            {participant.roles?.includes('admin') && (
                              <ShieldIcon
                                size={16}
                                color="#2563eb"
                              />
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded flex-shrink-0" style={{ backgroundColor: '#e6f2f9', color: '#005596' }}>
                          {participant.votesRemaining} vote{participant.votesRemaining !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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
        </div>
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
        onClose={() => {
          // Resume timer if it was paused
          if (timerSettings.isPaused && timerSettings.pausedRemainingSeconds !== null) {
            // Calculate new startTime to maintain the remaining seconds
            const newStartTime = Date.now() - (timerSettings.durationMinutes * 60 * 1000 - timerSettings.pausedRemainingSeconds * 1000);
            setTimerSettings({
              ...timerSettings,
              isRunning: true,
              isPaused: false,
              startTime: newStartTime,
              remainingSeconds: timerSettings.pausedRemainingSeconds,
              pausedRemainingSeconds: null,
            });
          }
          setShowVotingModal(false);
          setUserVote(null);
          setShowAddTimeSlider(false);
        }}
        title={showAddTimeSlider ? "Add More Time" : "Time's Up! Vote on Next Action"}
        showCloseButton={true}
      >
        {showAddTimeSlider && user?.roles?.includes('admin') ? (
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
        ) : timerExpired ? (
          // Timer expired - show 3 large circles with voting options
          <>
            <p className="mb-8 text-center text-gray-700 font-semibold">How should we proceed with this topic?</p>
            <div className="flex justify-center gap-6 mb-8">
              {/* Against - Thumbs Down */}
              <button
                onClick={() => handleVoteSubmit('against')}
                disabled={userVote !== null}
                onMouseEnter={() => setHoveredVote('against')}
                onMouseLeave={() => setHoveredVote(null)}
                className={`flex flex-col items-center gap-3 transition cursor-pointer ${
                  userVote === 'against' ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                } disabled:cursor-not-allowed`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition ${
                    userVote === 'against'
                      ? 'bg-red-600 scale-110'
                      : hoveredVote === 'against' ? 'bg-red-600' : 'bg-red-100'
                  }`}
                >
                  <ThumbsDownIcon 
                    size={40} 
                    color={userVote === 'against' || hoveredVote === 'against' ? '#ffffff' : '#dc2626'}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">Against</span>
              </button>

              {/* Neutral - Equal Sign */}
              <button
                onClick={() => handleVoteSubmit('neutral')}
                disabled={userVote !== null}
                onMouseEnter={() => setHoveredVote('neutral')}
                onMouseLeave={() => setHoveredVote(null)}
                className={`flex flex-col items-center gap-3 transition cursor-pointer ${
                  userVote === 'neutral' ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                } disabled:cursor-not-allowed`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition ${
                    userVote === 'neutral'
                      ? 'bg-yellow-600 scale-110'
                      : hoveredVote === 'neutral' ? 'bg-yellow-600' : 'bg-yellow-100'
                  }`}
                >
                  <EqualIcon 
                    size={40} 
                    color={userVote === 'neutral' || hoveredVote === 'neutral' ? '#ffffff' : '#ca8a04'}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">Neutral</span>
              </button>

              {/* Favor - Thumbs Up */}
              <button
                onClick={() => handleVoteSubmit('favor')}
                disabled={userVote !== null}
                onMouseEnter={() => setHoveredVote('favor')}
                onMouseLeave={() => setHoveredVote(null)}
                className={`flex flex-col items-center gap-3 transition cursor-pointer ${
                  userVote === 'favor' ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                } disabled:cursor-not-allowed`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition ${
                    userVote === 'favor'
                      ? 'bg-green-600 scale-110'
                      : hoveredVote === 'favor' ? 'bg-green-600' : 'bg-green-100'
                  }`}
                >
                  <ThumbsUpIcon 
                    size={40} 
                    color={userVote === 'favor' || hoveredVote === 'favor' ? '#ffffff' : '#16a34a'}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">Favor</span>
              </button>
            </div>

            {/* Vote Count Display */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-gray-700">Current Votes</p>
                <p className="text-xs text-gray-600">
                  {voteCount.against + voteCount.neutral + voteCount.favor} / {onlineUsers.size} voted
                </p>
              </div>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{voteCount.against}</div>
                  <div className="text-xs text-gray-600">Against</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{voteCount.neutral}</div>
                  <div className="text-xs text-gray-600">Neutral</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{voteCount.favor}</div>
                  <div className="text-xs text-gray-600">Favor</div>
                </div>
              </div>
            </div>

            {/* Admin Controls - Only show if current user is admin */}
            {user?.roles?.includes('admin') ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddTimeSlider(true)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  <ClockIcon size={20} className="text-white" />
                  Add More Time
                </button>
                <button
                  onClick={handleAdminFinishDiscussion}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  <CheckIcon size={20} color="white" />
                  Finish Discussion
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Waiting for admin to decide...</p>
                <button
                  onClick={() => {
                    setShowVotingModal(false);
                    setUserVote(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            )}
          </>
        ) : (
          // Finish early - show 2 buttons
          <>
            <p className="mb-6">Should we finish this topic or continue the discussion?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleVoteSubmit('finish')}
                disabled={userVote !== null}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  userVote === 'finish'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white'
                } disabled:cursor-not-allowed`}
              >
                <CheckIcon size={20} color="currentColor" />
                {userVote === 'finish' ? 'Voted to ' : ''}Finish Topic
              </button>
              <button
                onClick={() => handleVoteSubmit('continue')}
                disabled={userVote !== null}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  userVote === 'continue'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white'
                } disabled:cursor-not-allowed`}
              >
                <ClockIcon size={20} className="text-current" />
                {userVote === 'continue' ? 'Voted to ' : ''}Continue Topic
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Participants Modal */}
      <Modal
        isOpen={showDeleteParticipantsModal}
        onClose={() => setShowDeleteParticipantsModal(false)}
        title="Delete Participants?"
      >
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete {selectedParticipants.size} participant{selectedParticipants.size !== 1 ? 's' : ''}? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteParticipantsModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteParticipants}
            className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: '#dc2626' }}
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={showChangelogModal}
        onClose={() => setShowChangelogModal(false)}
      />
    </div>
  );
}
