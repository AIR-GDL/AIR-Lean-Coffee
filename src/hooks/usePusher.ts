'use client';

import { useEffect, useRef, useState } from 'react';
import { getPusherClient, setPresenceUserInfo, CHANNELS, EVENTS } from '@/lib/pusher-client';
import type { Channel, PresenceChannel } from 'pusher-js';

interface PusherCallbacks {
  onTopicCreated?: () => void;
  onTopicUpdated?: () => void;
  onTopicDeleted?: () => void;
  onDiscussionStarted?: (data: { topicId: string; startTime: number; durationMinutes: number }) => void;
  onDiscussionFinished?: (data: { topicId: string }) => void;
  onTimeAdded?: (data: { topicId: string; additionalSeconds: number; newStartTime: number }) => void;
  onVotingStarted?: (data: { topicId: string; triggeredBy: string; reason: 'timer-expired' | 'finish-early' }) => void;
  onVotingResolved?: (data: { topicId: string; result: 'finish' | 'continue'; resolvedBy: string }) => void;
  onUserUpdated?: () => void;
  onUserDeleted?: (data: { userId: string }) => void;
}

interface PresenceMember {
  id: string;
  info: {
    name: string;
  };
}

export function usePusher(callbacks: PusherCallbacks) {
  const channelRef = useRef<Channel | null>(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref up to date
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(CHANNELS.LEAN_COFFEE);
    channelRef.current = channel;

    channel.bind(EVENTS.TOPIC_CREATED, () => {
      callbacksRef.current.onTopicCreated?.();
    });

    channel.bind(EVENTS.TOPIC_UPDATED, () => {
      callbacksRef.current.onTopicUpdated?.();
    });

    channel.bind(EVENTS.TOPIC_DELETED, () => {
      callbacksRef.current.onTopicDeleted?.();
    });

    channel.bind(EVENTS.DISCUSSION_STARTED, (data: { topicId: string; startTime: number; durationMinutes: number }) => {
      callbacksRef.current.onDiscussionStarted?.(data);
    });

    channel.bind(EVENTS.DISCUSSION_FINISHED, (data: { topicId: string }) => {
      callbacksRef.current.onDiscussionFinished?.(data);
    });

    channel.bind(EVENTS.TIME_ADDED, (data: { topicId: string; additionalSeconds: number; newStartTime: number }) => {
      callbacksRef.current.onTimeAdded?.(data);
    });

    channel.bind(EVENTS.VOTING_STARTED, (data: { topicId: string; triggeredBy: string; reason: 'timer-expired' | 'finish-early' }) => {
      callbacksRef.current.onVotingStarted?.(data);
    });

    channel.bind(EVENTS.VOTING_RESOLVED, (data: { topicId: string; result: 'finish' | 'continue'; resolvedBy: string }) => {
      callbacksRef.current.onVotingResolved?.(data);
    });

    channel.bind(EVENTS.USER_UPDATED, () => {
      callbacksRef.current.onUserUpdated?.();
    });

    channel.bind(EVENTS.USER_DELETED, (data: { userId: string }) => {
      callbacksRef.current.onUserDeleted?.(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.LEAN_COFFEE);
      channelRef.current = null;
    };
  }, []);

  return channelRef;
}

export function usePresenceChannel(userInfo: { email: string; name: string } | null) {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, string>>(new Map());
  const channelRef = useRef<PresenceChannel | null>(null);

  useEffect(() => {
    if (!userInfo) return;

    // Set user info for auth headers before subscribing
    setPresenceUserInfo(userInfo);

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(CHANNELS.PRESENCE) as PresenceChannel;
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', (members: { each: (callback: (member: PresenceMember) => void) => void }) => {
      const online = new Map<string, string>();
      members.each((member: PresenceMember) => {
        online.set(member.id, member.info.name);
      });
      setOnlineUsers(online);
    });

    channel.bind('pusher:member_added', (member: PresenceMember) => {
      setOnlineUsers((prev) => {
        const next = new Map(prev);
        next.set(member.id, member.info.name);
        return next;
      });
    });

    channel.bind('pusher:member_removed', (member: PresenceMember) => {
      setOnlineUsers((prev) => {
        const next = new Map(prev);
        next.delete(member.id);
        return next;
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.PRESENCE);
      channelRef.current = null;
    };
  }, [userInfo]);

  return { onlineUsers };
}
