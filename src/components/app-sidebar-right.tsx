'use client';

import * as React from 'react';
import { LogOut, Clock, Users, Trash2 } from 'lucide-react';
import { User } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TimerSettings {
  durationMinutes: number;
  isRunning: boolean;
}

interface Participant {
  _id: string;
  name: string;
  email: string;
  votesRemaining: number;
}

interface AppSidebarRightProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
  timerSettings: TimerSettings;
  onTimerChange: (minutes: number) => void;
  participants: Participant[];
  onLogout: () => void;
  selectedParticipants: Set<string>;
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  onToggleParticipantSelection: (userId: string) => void;
  onDeleteParticipants: () => void;
}

export function AppSidebarRight({
  user,
  timerSettings,
  onTimerChange,
  participants,
  onLogout,
  selectedParticipants,
  isSelectMode,
  onToggleSelectMode,
  onToggleParticipantSelection,
  onDeleteParticipants,
  ...props
}: AppSidebarRightProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-[#005596] text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-sm truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Logout"
            className="h-8 w-8 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold text-white"
              style={{ backgroundColor: '#005596' }}
            >
              {user.votesRemaining}
            </span>
            Votes Remaining
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((vote) => (
                  <div
                    key={vote}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      vote <= user.votesRemaining ? 'bg-[#005596]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Discussion Duration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 space-y-2">
              <input
                type="range"
                min="1"
                max="20"
                value={timerSettings.durationMinutes}
                onChange={(e) => onTimerChange(parseInt(e.target.value))}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none ${
                  timerSettings.isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{ accentColor: '#005596' }}
                disabled={timerSettings.isRunning}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span className="font-bold text-[#005596]">
                  {timerSettings.durationMinutes} min
                </span>
                <span>20 min</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants ({participants.length})
            </span>
            <div className="flex items-center gap-1">
              {isSelectMode && selectedParticipants.size > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDeleteParticipants}
                  className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100"
                  title="Delete selected"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSelectMode}
                className="h-6 px-2 text-xs"
              >
                {isSelectMode ? 'Done' : 'Select'}
              </Button>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 min-h-0 overflow-hidden">
            <SidebarMenu className="h-full overflow-y-auto">
              {participants.map((participant) => (
                <SidebarMenuItem key={participant._id}>
                  <SidebarMenuButton
                    className={`w-full ${isSelectMode ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => isSelectMode && onToggleParticipantSelection(participant._id)}
                  >
                    {isSelectMode && (
                      <input
                        type="checkbox"
                        checked={selectedParticipants.has(participant._id)}
                        onChange={() => onToggleParticipantSelection(participant._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded cursor-pointer"
                      />
                    )}
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-gray-200">
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm">{participant.name}</span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#e6f2f9', color: '#005596' }}
                    >
                      {participant.votesRemaining}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-3 py-2 text-center text-xs text-muted-foreground">
          AIR Lean Coffee
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
