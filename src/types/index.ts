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
  content: string;
  author: string;
  votes: number;
  status: 'to-discuss' | 'discussing' | 'discussed';
  createdAt: string;
}

// Client-side types
export type ColumnType = 'toDiscuss' | 'discussing' | 'discussed' | 'actions';

export interface TimerSettings {
  durationMinutes: number;
  isRunning: boolean;
  startTime: number | null;
  remainingSeconds: number | null;
  currentTopicId: string | null;
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
  content: string;
  author: string;
}

export interface UpdateTopicRequest {
  action?: 'VOTE';
  userEmail?: string;
  status?: 'to-discuss' | 'discussing' | 'discussed';
}
