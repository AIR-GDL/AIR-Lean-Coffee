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
  SidebarSeparator,
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
    <Sidebar className="border-r-0 overflow-x-hidden" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 overflow-hidden">
          <Image
            src="/lean_coffee_logo_small.svg"
            alt="Lean Coffee"
            width={40}
            height={40}
            priority
            className="w-10 h-10"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Lean Coffee</span>
            <span className="text-xs text-muted-foreground">Improving</span>
          </div>
        </div>
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
