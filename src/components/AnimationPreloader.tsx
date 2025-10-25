'use client';

import { useEffect } from 'react';

export default function AnimationPreloader() {
  useEffect(() => {
    // Preload Lottie animation on app load
    fetch('/animations/loading.json')
      .then((res) => res.json())
      .catch((err) => console.error('Error preloading animation:', err));
  }, []);

  return null;
}
