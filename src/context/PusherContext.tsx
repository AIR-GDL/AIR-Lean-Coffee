'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import type PusherClient from 'pusher-js';
import type { Channel } from 'pusher-js';

interface PusherContextType {
  pusher: PusherClient | null;
  isConnected: boolean;
  subscribe: (channelName: string) => Channel | null;
  unsubscribe: (channelName: string) => void;
}

const PusherContext = createContext<PusherContextType | undefined>(undefined);

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const channelsRef = useRef<Map<string, Channel>>(new Map());

  const pusherClient = getPusherClient();

  useEffect(() => {
    if (!pusherClient) return;

    // Connect to Pusher
    pusherClient.connection.bind('connected', () => {
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    return () => {
      pusherClient.connection.unbind('connected');
      pusherClient.connection.unbind('disconnected');
    };
  }, [pusherClient]);

  const subscribe = useCallback((channelName: string): Channel | null => {
    if (!pusherClient) return null;

    if (channelsRef.current.has(channelName)) {
      return channelsRef.current.get(channelName) || null;
    }

    const channel = pusherClient.subscribe(channelName);
    channelsRef.current.set(channelName, channel);
    return channel;
  }, [pusherClient]);

  const unsubscribe = useCallback((channelName: string) => {
    if (!pusherClient) return;

    if (channelsRef.current.has(channelName)) {
      pusherClient.unsubscribe(channelName);
      channelsRef.current.delete(channelName);
    }
  }, [pusherClient]);

  const contextValue = useMemo(() => ({
    pusher: pusherClient,
    isConnected,
    subscribe,
    unsubscribe,
  }), [pusherClient, isConnected, subscribe, unsubscribe]);

  return (
    <PusherContext.Provider value={contextValue}>
      {children}
    </PusherContext.Provider>
  );
}

export function usePusher() {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
}
