'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import LottieLoader from '@/components/LottieLoader';

interface LoaderContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
  animationData: object | null;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

const MIN_LOADING_DURATION = 3000; // 3 seconds minimum

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('Loading...');
  const [animationData, setAnimationData] = useState<object | null>(null);
  const loadingStartTime = useRef<number | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload animation on mount with priority
  useEffect(() => {
    const preloadAnimation = async () => {
      try {
        const response = await fetch('/animations/loading.json', {
          priority: 'high' as any,
        });
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error('Error preloading animation:', err);
      }
    };

    // Start preload immediately
    preloadAnimation();
  }, []);

  const showLoader = useCallback((msg: string = 'Loading...') => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    setMessage(msg);
    setIsLoading(true);
    loadingStartTime.current = Date.now();
  }, []);

  const hideLoader = useCallback(() => {
    if (!loadingStartTime.current) {
      setIsLoading(false);
      return;
    }

    const elapsedTime = Date.now() - loadingStartTime.current;
    const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsedTime);

    if (remainingTime > 0) {
      // Wait for the remaining time before hiding
      hideTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingStartTime.current = null;
        hideTimeoutRef.current = null;
      }, remainingTime);
    } else {
      // Minimum time already elapsed, hide immediately
      setIsLoading(false);
      loadingStartTime.current = null;
    }
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading, animationData }}>
      {children}
      {isLoading && <LottieLoader message={message} preloadedAnimation={animationData} />}
    </LoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useGlobalLoader must be used within a LoaderProvider');
  }
  return context;
}
