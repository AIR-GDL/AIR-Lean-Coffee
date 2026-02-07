'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Coffee,
  History,
  Bug,
  FileText,
  Plus,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';

type ViewType = 'board' | 'history' | 'bugs';

interface AppSidebarLeftProps extends React.ComponentProps<typeof Sidebar> {
  onReportBug?: () => void;
  onViewChangelog?: () => void;
  currentView?: ViewType;
  onNavigate?: (view: ViewType) => void;
}

export function AppSidebarLeft({
  onReportBug,
  onViewChangelog,
  currentView = 'board',
  onNavigate,
  ...props
}: AppSidebarLeftProps) {

  return (
    <Sidebar className="border-r-0 overflow-x-hidden" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 overflow-hidden">
          <Image
            src="/lean_coffee_logo_small.svg"
            alt="AIR Lean Coffee"
            width={40}
            height={40}
            priority
            className="w-10 h-10"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">AIR Lean Coffee</span>
            <span className="text-xs text-muted-foreground">Improving</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Current Board</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={currentView === 'board'} tooltip="Main Board" onClick={() => onNavigate?.('board')}>
                  <Coffee className="text-[#005596]" />
                  <span>Main Board</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Boards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Create New Board" disabled>
                  <Plus />
                  <span>New Board</span>
                  <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Discussion History"
                  isActive={currentView === 'history'}
                  onClick={() => onNavigate?.('history')}
                >
                  <History />
                  <span>Discussion History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Bug Reports"
                  isActive={currentView === 'bugs'}
                  onClick={() => onNavigate?.('bugs')}
                >
                  <Bug />
                  <span>Bug Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Report a Bug" onClick={onReportBug}>
                  <Bug />
                  <span>Report a Bug</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="View Changelog" onClick={onViewChangelog}>
                  <FileText />
                  <span>Changelog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" disabled>
                  <Settings />
                  <span>Settings</span>
                  <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
