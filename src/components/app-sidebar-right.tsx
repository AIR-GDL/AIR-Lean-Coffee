'use client';

import * as React from 'react';
import { LogOut, Clock, Users, Trash2, ShieldCheck, UserCog } from 'lucide-react';
import { User } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TimerSettings {
  durationMinutes: number;
  isRunning: boolean;
}

interface Participant {
  _id: string;
  name: string;
  email: string;
  votesRemaining: number;
  roles?: string[];
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
  onlineUsers: Map<string, string>;
  onRoleChange: (userId: string, newRole: 'admin' | 'user') => void;
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
  onlineUsers,
  onRoleChange,
  ...props
}: AppSidebarRightProps) {
  const isAdmin = user.roles?.includes('admin');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  };

  const isParticipantAdmin = (participant: Participant) => {
    return participant.roles?.includes('admin');
  };

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex overflow-x-hidden"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-10 w-10 shrink-0">
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
            className="h-8 w-8 shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Badge className="bg-[#005596] hover:bg-[#005596] text-white text-xs px-1.5 py-0 h-5">
              {user.votesRemaining}
            </Badge>
            Votes Remaining
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 pt-1">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((vote) => (
                  <div
                    key={vote}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      vote <= user.votesRemaining ? 'bg-[#005596]' : 'bg-muted'
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
            {isAdmin ? (
              <div className="px-3 space-y-3 pt-1">
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[timerSettings.durationMinutes]}
                  onValueChange={(value) => onTimerChange(value[0])}
                  disabled={timerSettings.isRunning}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 min</span>
                  <span className="font-bold text-[#005596]">
                    {timerSettings.durationMinutes} min
                  </span>
                  <span>20 min</span>
                </div>
              </div>
            ) : (
              <div className="px-3 pt-1 flex items-center justify-center">
                <span className="text-3xl font-bold text-[#005596]">
                  {timerSettings.durationMinutes} min
                </span>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="flex-1 min-h-0 flex flex-col">
          <SidebarGroupLabel className="flex items-center justify-between shrink-0">
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
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
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
          <SidebarGroupContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-1 px-1">
                {participants.map((participant) => (
                  <div
                    key={participant._id}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      isSelectMode
                        ? 'cursor-pointer hover:bg-sidebar-accent'
                        : ''
                    }`}
                    onClick={() => isSelectMode && onToggleParticipantSelection(participant._id)}
                  >
                    {isSelectMode && (
                      <Checkbox
                        checked={selectedParticipants.has(participant._id)}
                        onCheckedChange={() => onToggleParticipantSelection(participant._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                    )}
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className={`text-[10px] text-white font-semibold ${
                        onlineUsers.has(participant.email)
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}>
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate">{participant.name}</span>
                    {isParticipantAdmin(participant) && (
                      <span className="shrink-0" aria-label="Admin">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#005596]" />
                      </span>
                    )}
                    {isAdmin && !isSelectMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRoleChange(
                            participant._id,
                            isParticipantAdmin(participant) ? 'user' : 'admin'
                          );
                        }}
                        aria-label={isParticipantAdmin(participant) ? 'Remove admin' : 'Make admin'}
                      >
                        <UserCog className="h-3 w-3" />
                      </Button>
                    )}
                    <Badge variant="secondary" className="bg-[#e6f2f9] text-[#005596] hover:bg-[#e6f2f9] shrink-0 text-xs px-1.5 py-0 h-5">
                      {participant.votesRemaining}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
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
