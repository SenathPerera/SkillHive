import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

/**
 * Props:
 *  - lessonIndex: number
 *  - planId: string
 *  - onSessionComplete: (lessonIndex: number, seconds: number) => void
 */
export function PomodoroTimer({ lessonIndex, planId, onSessionComplete }) {
  const FOCUS_SECONDS = 25 * 60;
  const BREAK_SECONDS = 5 * 60;

  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [phase, setPhase] = useState('focus'); // 'focus' or 'break'
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(sec => {
        if (sec <= 1) {
          clearInterval(intervalRef.current);
          if (phase === 'focus') {
            onSessionComplete(lessonIndex, FOCUS_SECONDS);
          }
          const nextPhase = phase === 'focus' ? 'break' : 'focus';
          setPhase(nextPhase);
          return nextPhase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phase, lessonIndex, onSessionComplete]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="p-4 bg-green-100 rounded-lg border-2 border-green-800 flex flex-col items-center space-y-4">
      <div className="text-sm font-semibold text-gray-500">
        {phase === 'focus' ? 'Focus Time' : 'Break Time'}
      </div>
      <div className="text-4xl font-mono text-gray-900">
        {minutes}:{secs}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => setRunning(r => !r)}
          className={`p-2 rounded-full focus:outline-none focus:ring-2 ${
            running
              ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 text-white'
              : 'bg-green-500 hover:bg-green-600 focus:ring-green-300 text-white'
          }`}
        >
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={() => {
            clearInterval(intervalRef.current);
            setRunning(false);
            setPhase('focus');
            setSecondsLeft(FOCUS_SECONDS);
          }}
          className="p-2 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full text-gray-700"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
