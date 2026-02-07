import PusherClient from 'pusher-js';

let pusherInstance: PusherClient | null = null;
let currentUserInfo: { email: string; name: string } | null = null;

export function setPresenceUserInfo(info: { email: string; name: string } | null) {
  currentUserInfo = info;
}

export function getPusherClient(): PusherClient | null {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
    if (!pusherInstance) {
      console.warn('Pusher env vars missing (NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER). Real-time features disabled.');
    }
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        channelAuthorization: {
          endpoint: '/api/pusher/auth',
          transport: 'ajax',
          headersProvider: () => {
            if (currentUserInfo) {
              return { 'X-User-Info': JSON.stringify(currentUserInfo) };
            }
            return {};
          },
        },
      }
    );
  }
  return pusherInstance;
}

// Re-export channel/event constants for client use
export const CHANNELS = {
  LEAN_COFFEE: 'lean-coffee',
  PRESENCE: 'presence-lean-coffee',
} as const;

export const EVENTS = {
  TOPIC_CREATED: 'topic-created',
  TOPIC_UPDATED: 'topic-updated',
  TOPIC_DELETED: 'topic-deleted',
  DISCUSSION_STARTED: 'discussion-started',
  DISCUSSION_FINISHED: 'discussion-finished',
  TIME_ADDED: 'time-added',
  VOTING_STARTED: 'voting-started',
  VOTING_RESOLVED: 'voting-resolved',
  VOTE_CAST: 'vote-cast',
  DURATION_CHANGED: 'duration-changed',
  USER_UPDATED: 'user-updated',
  USER_DELETED: 'user-deleted',
} as const;
