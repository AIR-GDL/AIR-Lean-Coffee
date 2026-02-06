'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { LoginForm } from '@/components/login-form';
import Board from '@/components/Board';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarLeft } from '@/components/app-sidebar-left';
import { AppSidebarRight } from '@/components/app-sidebar-right';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUsers } from '@/hooks/useUsers';
import BugReportModal from '@/components/BugReportModal';
import ChangelogModal from '@/components/ChangelogModal';

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
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteParticipantsModal, setShowDeleteParticipantsModal] = useState(false);
  
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

  const handleTimerChange = (minutes: number) => {
    setTimerSettings({ ...timerSettings, durationMinutes: minutes });
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

  const handleDeleteParticipants = () => {
    if (selectedParticipants.size > 0) {
      setShowDeleteParticipantsModal(true);
    }
  };

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
          onViewChangelog={() => setShowChangelogModal(true)}
        />
        <SidebarInset className="flex flex-col h-svh overflow-hidden">
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
        />
      </SidebarProvider>

      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
      />

      <ChangelogModal
        isOpen={showChangelogModal}
        onClose={() => setShowChangelogModal(false)}
      />
    </>
  );
}
