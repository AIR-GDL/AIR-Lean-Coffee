'use client';

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

interface LottieLoaderProps {
  message?: string;
  preloadedAnimation?: object | null;
}

export default function LottieLoader({ message = 'Loading...', preloadedAnimation }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState<object | null>(preloadedAnimation || null);
  const [isLoading, setIsLoading] = useState(!preloadedAnimation);

  useEffect(() => {
    // If animation is already preloaded, use it immediately
    if (preloadedAnimation) {
      setAnimationData(preloadedAnimation);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch it
    const controller = new AbortController();
    
    fetch('/animations/loading.json', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error loading Lottie animation:', err);
        }
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [preloadedAnimation]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop
            className="w-20 h-20"
          />
        )}
        {message && (
          <p className="text-gray-800 text-lg font-bold">{message}</p>
        )}
      </div>
    </div>
  );
}
