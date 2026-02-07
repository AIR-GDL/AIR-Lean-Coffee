'use client';

import { useEffect, useState } from 'react';
import { Clock, SquareIcon } from 'lucide-react';

interface TimerProps {
  remainingSeconds: number;
  onTimeUp: () => void;
  onFinishEarly?: () => void;
}

export default function Timer({ remainingSeconds, onTimeUp, onFinishEarly }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  const iconColor = isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600';

  return (
    <div className={`flex items-center justify-center gap-3 p-6 rounded-2xl shadow-lg transition-all ${
      isCritical 
        ? 'bg-red-100 border-4 border-red-500 animate-pulse' 
        : isWarning 
        ? 'bg-yellow-100 border-4 border-yellow-500' 
        : 'bg-blue-100 border-4 border-blue-500'
    }`}>
      <Clock className={`h-8 w-8 ${iconColor}`} />
      <div className="text-6xl font-bold tabular-nums">
        <span className={isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600'}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      {onFinishEarly && (
        <button
          onClick={onFinishEarly}
          className={`ml-2 p-2 rounded-xl transition-colors ${
            isCritical
              ? 'hover:bg-red-200 text-red-600'
              : isWarning
              ? 'hover:bg-yellow-200 text-yellow-600'
              : 'hover:bg-blue-200 text-blue-600'
          }`}
          title="Finish Early"
          aria-label="Finish Early"
        >
          <SquareIcon className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}
