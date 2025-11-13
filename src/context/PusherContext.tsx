'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import pusherClient from '@/lib/pusher-client';
import type { Channel } from 'pusher-js';

interface PusherContextType {
  pusher: typeof pusherClient;
  isConnected: boolean;
  subscribe: (channelName: string) => Channel | null;
  unsubscribe: (channelName: string) => void;
}

const PusherContext = createContext<PusherContextType | undefined>(undefined);

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Map<string, Channel>>(new Map());

  useEffect(() => {
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
  }, []);

  const subscribe = (channelName: string): Channel | null => {
    if (channels.has(channelName)) {
      return channels.get(channelName) || null;
    }

    const channel = pusherClient.subscribe(channelName);
    setChannels((prev) => new Map(prev).set(channelName, channel));
    return channel;
  };

  const unsubscribe = (channelName: string) => {
    if (channels.has(channelName)) {
      pusherClient.unsubscribe(channelName);
      setChannels((prev) => {
        const newChannels = new Map(prev);
        newChannels.delete(channelName);
        return newChannels;
      });
    }
  };

  return (
    <PusherContext.Provider value={{ pusher: pusherClient, isConnected, subscribe, unsubscribe }}>
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
