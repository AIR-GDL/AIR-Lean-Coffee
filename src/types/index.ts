// API response types from MongoDB
export interface User {
  _id: string;
  name: string;
  email: string;
  votesRemaining: number;
  createdAt: string;
}

export interface Topic {
  _id: string;
  title: string;
  description?: string;
  author: string;
  votes: number;
  votedBy: string[]; // Array of user emails who voted
  status: 'to-discuss' | 'discussing' | 'discussed';
  archived: boolean; // Whether the topic has been archived
  createdAt: string;
  discussedAt?: string;
  totalTimeDiscussed: number; // Total discussion time in seconds
}

// Client-side types
export type ColumnType = 'toDiscuss' | 'discussing' | 'discussed' | 'actions';

export interface TimerSettings {
  durationMinutes: number;
  isRunning: boolean;
  startTime: number | null;
  remainingSeconds: number | null;
  currentTopicId: string | null;
  isPaused: boolean;
  pausedRemainingSeconds: number | null;
}

export interface VoteResult {
  finishTopic: number;
  continueDiscussion: number;
}

// API request/response types
export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface CreateTopicRequest {
  title: string;
  description?: string;
  author: string;
}

export interface UpdateTopicRequest {
  action?: 'VOTE';
  userEmail?: string;
  status?: 'to-discuss' | 'discussing' | 'discussed';
  title?: string;
  description?: string;
  totalTimeDiscussed?: number;
  archived?: boolean;
}
