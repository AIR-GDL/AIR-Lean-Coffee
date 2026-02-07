import Pusher from 'pusher';

let pusherServer: Pusher | null = null;

if (
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
) {
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
} else {
  console.warn('Pusher server env vars missing. Real-time features disabled.');
}

export default pusherServer;

// Channel and event constants
export const CHANNELS = {
  LEAN_COFFEE: 'lean-coffee',
  PRESENCE: 'presence-lean-coffee',
} as const;

export const EVENTS = {
  // Topic events
  TOPIC_CREATED: 'topic-created',
  TOPIC_UPDATED: 'topic-updated',
  TOPIC_DELETED: 'topic-deleted',

  // Discussion/timer events
  DISCUSSION_STARTED: 'discussion-started',
  DISCUSSION_FINISHED: 'discussion-finished',
  TIME_ADDED: 'time-added',

  // Voting events
  VOTING_STARTED: 'voting-started',
  VOTING_RESOLVED: 'voting-resolved',
  VOTE_CAST: 'vote-cast',

  // Settings events
  DURATION_CHANGED: 'duration-changed',

  // User events
  USER_UPDATED: 'user-updated',
  USER_DELETED: 'user-deleted',
} as const;
