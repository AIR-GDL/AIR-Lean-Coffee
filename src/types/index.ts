export interface User {
  name: string;
  email: string;
  votesRemaining: number;
  votedTopics: string[]; // Array of topic IDs
}

export type ColumnType = 'toDiscuss' | 'discussing' | 'discussed' | 'actions';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  votes: number;
  createdAt: number;
  columnId: ColumnType;
  votedBy: string[]; // Array of user emails who voted for this topic
}

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
