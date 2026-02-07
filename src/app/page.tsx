'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User } from '@/types';
import { LoginForm } from '@/components/login-form';
import Board from '@/components/Board';
import HistoryView from '@/components/HistoryView';
import BugsView from '@/components/BugsView';
import ReportsView from '@/components/ReportsView';
import ChangelogView from '@/components/ChangelogView';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarLeft } from '@/components/app-sidebar-left';
import { AppSidebarRight } from '@/components/app-sidebar-right';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUsers } from '@/hooks/useUsers';
import { usePresenceChannel } from '@/hooks/usePusher';
import { EVENTS } from '@/lib/pusher-client';
import { updateUserRole } from '@/lib/api';
import BugReportModal from '@/components/BugReportModal';

type ViewType = 'board' | 'history' | 'bugs' | 'reports' | 'changelog';

interface TimerSettings {
  durationMinutes: number;
  isRunning: boolean;
  startTime: number | null;
  remainingSeconds: number | null;
  currentTopicId: string | null;
  isPaused: boolean;
  pausedRemainingSeconds: number | null;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteParticipantsModal, setShowDeleteParticipantsModal] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [bugFilters, setBugFilters] = useState({ severity: [] as string[], status: [] as string[], searchQuery: '' });
  
  const [timerSettings, setTimerSettings] = useLocalStorage<TimerSettings>('lean-coffee-timer', {
    durationMinutes: 5,
    isRunning: false,
    startTime: null,
    remainingSeconds: null,
    currentTopicId: null,
    isPaused: false,
    pausedRemainingSeconds: null,
  });
  
  const { users, mutate: mutateUsers } = useUsers();

  const presenceInfo = useMemo(() => {
    if (!user) return null;
    return { email: user.email, name: user.name };
  }, [user]);
  const { onlineUsers } = usePresenceChannel(presenceInfo);

  useEffect(() => {
    const loadUserFromSession = () => {
      try {
        const storedUser = sessionStorage.getItem('lean-coffee-user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user from sessionStorage:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadUserFromSession();
  }, []);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    try {
      sessionStorage.setItem('lean-coffee-user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to save user to sessionStorage:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('lean-coffee-user');
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  };

  const durationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleTimerChange = useCallback((minutes: number) => {
    setTimerSettings((prev) => ({ ...prev, durationMinutes: minutes }));

    // Debounce Pusher broadcast (500ms)
    if (durationDebounceRef.current) {
      clearTimeout(durationDebounceRef.current);
    }
    durationDebounceRef.current = setTimeout(() => {
      broadcastEvent(EVENTS.DURATION_CHANGED, {
        durationMinutes: minutes,
        changedBy: user?.email || '',
      });
    }, 500);
  }, [user?.email, broadcastEvent, setTimerSettings]);

  const handleToggleParticipantSelection = (userId: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedParticipants(newSelected);
  };

  const handleDeleteParticipants = () => {
    if (selectedParticipants.size > 0) {
      setShowDeleteParticipantsModal(true);
    }
  };

  const handleRoleChange = useCallback(async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const roles = newRole === 'admin' ? ['admin'] : ['user'];
      const updatedUser = await updateUserRole(userId, roles);
      await mutateUsers();
      // If the changed user is the current user, update session
      if (user && updatedUser.email === user.email) {
        const newUser = { ...user, roles: updatedUser.roles };
        setUser(newUser);
        sessionStorage.setItem('lean-coffee-user', JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  }, [user, mutateUsers]);

  if (!isHydrated) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm onRegister={handleRegister} />
        </div>
      </div>
    );
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebarLeft
          onReportBug={() => setShowBugReportModal(true)}
          currentView={currentView}
          onNavigate={setCurrentView}
        />
        <SidebarInset className="flex flex-col h-svh overflow-hidden">
          {currentView === 'board' && (
            <Board
              user={user}
              onLogout={handleLogout}
              timerSettings={timerSettings}
              setTimerSettings={setTimerSettings}
              setUser={setUser}
              selectedParticipants={selectedParticipants}
              setSelectedParticipants={setSelectedParticipants}
              isSelectMode={isSelectMode}
              setIsSelectMode={setIsSelectMode}
              showDeleteParticipantsModal={showDeleteParticipantsModal}
              setShowDeleteParticipantsModal={setShowDeleteParticipantsModal}
            />
          )}
          {currentView === 'history' && <HistoryView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'bugs' && <BugsView filters={bugFilters} />}
          {currentView === 'changelog' && <ChangelogView />}
        </SidebarInset>
        <AppSidebarRight
          user={user}
          timerSettings={timerSettings}
          onTimerChange={handleTimerChange}
          participants={users}
          onLogout={handleLogout}
          selectedParticipants={selectedParticipants}
          isSelectMode={isSelectMode}
          onToggleSelectMode={() => setIsSelectMode(!isSelectMode)}
          onToggleParticipantSelection={handleToggleParticipantSelection}
          onDeleteParticipants={handleDeleteParticipants}
          onlineUsers={onlineUsers}
          onRoleChange={handleRoleChange}
          currentView={currentView}
          bugFilters={bugFilters}
          onBugFiltersChange={setBugFilters}
        />
      </SidebarProvider>

      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
      />
    </>
  );
}
