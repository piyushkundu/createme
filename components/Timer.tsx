'use client';

import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export default function Timer() {
  const { elapsedTime, updateTime, phase } = useGameStore();

  useEffect(() => {
    if (phase === 'playing') {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, updateTime]);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  
  return (
    <div className="font-mono text-base md:text-xl font-bold bg-slate-900/60 backdrop-blur-md rounded-lg md:rounded-2xl px-2.5 py-1.5 md:px-5 md:py-2.5 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:border-white/40 flex items-center">
      <span className="opacity-90 mr-1.5 md:mr-2 text-white text-sm md:text-base">⏱</span>
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
