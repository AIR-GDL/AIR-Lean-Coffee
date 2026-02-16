'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Coffee,
  History,
  Bug,
  FileText,
  BarChart3,
  Settings,
  LifeBuoy,
  Send,
  MoreHorizontal,
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
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewType = 'board' | 'history' | 'bugs' | 'reports' | 'changelog';

interface AppSidebarLeftProps extends React.ComponentProps<typeof Sidebar> {
  onReportBug?: () => void;
  currentView?: ViewType;
  onNavigate?: (view: ViewType) => void;
}

export function AppSidebarLeft({
  onReportBug,
  currentView = 'board',
  onNavigate,
  ...props
}: AppSidebarLeftProps) {

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" onClick={() => onNavigate?.('board')}>
              <div className="flex aspect-square size-8 items-center justify-center">
                <Image
                  src="/lean_coffee_logo_small.svg"
                  alt="Lean Coffee"
                  width={32}
                  height={32}
                  priority
                  className="w-8 h-8"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Lean Coffee</span>
                <span className="truncate text-xs text-muted-foreground">Improving</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Board</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={currentView === 'board'} tooltip="AIR Board" onClick={() => onNavigate?.('board')}>
                  <Coffee className="text-[#005596]" />
                  <span>AIR Board</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-2 border-b border-sidebar-border" />

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
                  tooltip="Reports"
                  isActive={currentView === 'reports'}
                  onClick={() => onNavigate?.('reports')}
                >
                  <BarChart3 />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Changelog"
                  isActive={currentView === 'changelog'}
                  onClick={() => onNavigate?.('changelog')}
                >
                  <FileText />
                  <span>Changelog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton tooltip="Support">
                      <LifeBuoy />
                      <span>Support</span>
                      <MoreHorizontal className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-48">
                    <DropdownMenuItem onClick={onReportBug}>
                      <Bug className="h-4 w-4" />
                      <span>Report a Bug</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate?.('bugs')}>
                      <Bug className="h-4 w-4" />
                      <span>Bug History</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Feedback" asChild>
                  <a href="mailto:carlos.diaz@improving.com">
                    <Send />
                    <span>Feedback</span>
                  </a>
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
