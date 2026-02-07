'use client';

import * as React from 'react';
import { useState } from 'react';
import { LogOut, Clock, Users, Trash2, ShieldCheck, ShieldMinus, ShieldPlus, Bug, ChevronDown, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
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

interface BugFilters {
  severity: string[];
  status: string[];
  searchQuery: string;
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
  currentView?: 'board' | 'history' | 'bugs';
  bugFilters?: BugFilters;
  onBugFiltersChange?: (filters: BugFilters) => void;
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
  currentView = 'board',
  bugFilters,
  onBugFiltersChange,
  ...props
}: AppSidebarRightProps) {
  const isAdmin = user.roles?.includes('admin');
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; name: string; newRole: 'admin' | 'user' } | null>(null);

  const capitalizeName = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

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

        {currentView === 'bugs' && bugFilters && onBugFiltersChange ? (
          <SidebarGroup className="flex-1 min-h-0 flex flex-col">
            <SidebarGroupLabel className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Bug Filters
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="px-3 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Search</span>
                    </div>
                    <Input
                      type="text"
                      placeholder="Search bugs..."
                      value={bugFilters.searchQuery}
                      onChange={(e) => onBugFiltersChange({ ...bugFilters, searchQuery: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-medium mb-2 block">Severity</span>
                    <div className="space-y-1.5">
                      {['high', 'medium', 'low'].map((severity) => (
                        <label key={severity} className="flex items-center gap-2 cursor-pointer text-sm px-1 py-0.5 rounded hover:bg-sidebar-accent">
                          <Checkbox
                            checked={bugFilters.severity.includes(severity)}
                            onCheckedChange={() => {
                              const newSev = bugFilters.severity.includes(severity)
                                ? bugFilters.severity.filter((s) => s !== severity)
                                : [...bugFilters.severity, severity];
                              onBugFiltersChange({ ...bugFilters, severity: newSev });
                            }}
                          />
                          <span className="capitalize flex-1">{severity}</span>
                          <Badge
                            variant={severity === 'high' ? 'destructive' : 'secondary'}
                            className={`text-[10px] px-1.5 py-0 h-4 ${severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : severity === 'low' ? 'bg-green-100 text-green-800' : ''}`}
                          >
                            {severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium mb-2 block">Status</span>
                    <div className="space-y-1.5">
                      {['open', 'in-progress', 'resolved'].map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm px-1 py-0.5 rounded hover:bg-sidebar-accent">
                          <Checkbox
                            checked={bugFilters.status.includes(status)}
                            onCheckedChange={() => {
                              const newSt = bugFilters.status.includes(status)
                                ? bugFilters.status.filter((s) => s !== status)
                                : [...bugFilters.status, status];
                              onBugFiltersChange({ ...bugFilters, status: newSt });
                            }}
                          />
                          <span className="capitalize flex-1">{status.replace('-', ' ')}</span>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 h-4 ${status === 'resolved' ? 'bg-green-100 text-green-800' : status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}`}
                          >
                            {status === 'resolved' ? '✓' : status === 'in-progress' ? '⟳' : '○'}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  {(bugFilters.severity.length > 0 || bugFilters.status.length > 0 || bugFilters.searchQuery) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onBugFiltersChange({ severity: [], status: [], searchQuery: '' })}
                      className="w-full h-7 text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
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
                      <span className="flex-1 truncate">{capitalizeName(participant.name)}</span>
                      {isParticipantAdmin(participant) && (
                        <span className="shrink-0" aria-label="Admin">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#005596]" />
                        </span>
                      )}
                      {isAdmin && !isSelectMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 shrink-0 ${isParticipantAdmin(participant) ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-[#005596] hover:text-[#004478] hover:bg-blue-50'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingRoleChange({
                              userId: participant._id,
                              name: capitalizeName(participant.name),
                              newRole: isParticipantAdmin(participant) ? 'user' : 'admin',
                            });
                          }}
                          aria-label={isParticipantAdmin(participant) ? 'Remove admin' : 'Make admin'}
                        >
                          {isParticipantAdmin(participant) ? (
                            <ShieldMinus className="h-3 w-3" />
                          ) : (
                            <ShieldPlus className="h-3 w-3" />
                          )}
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
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-3 py-2 text-center text-xs text-muted-foreground">
          AIR Lean Coffee
        </div>
      </SidebarFooter>

      <AlertDialog open={!!pendingRoleChange} onOpenChange={(open) => !open && setPendingRoleChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingRoleChange?.newRole === 'admin' ? 'Promote to Admin' : 'Remove Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRoleChange?.newRole === 'admin'
                ? `Are you sure you want to promote ${pendingRoleChange?.name} to admin? They will be able to manage discussions, users, and settings.`
                : `Are you sure you want to remove admin privileges from ${pendingRoleChange?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRoleChange) {
                  onRoleChange(pendingRoleChange.userId, pendingRoleChange.newRole);
                  setPendingRoleChange(null);
                }
              }}
              className={pendingRoleChange?.newRole === 'admin' ? 'bg-[#005596] hover:bg-[#004478]' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            >
              {pendingRoleChange?.newRole === 'admin' ? 'Promote' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
