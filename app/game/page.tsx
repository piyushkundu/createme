'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import Map from '../../components/Map';
import GameUI from '../../components/GameUI';

export default function GamePage() {
  const router = useRouter();
  const { phase, playerName } = useGameStore();

  useEffect(() => {
    if (phase === 'idle' || !playerName) {
      router.push('/');
    } else if (phase === 'finished') {
      router.push('/leaderboard');
    }
  }, [phase, router, playerName]);

  if (phase !== 'playing') return null;

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <GameUI />
      
      {/* Map container: fills entire screen */}
      <div className="absolute inset-0 z-0">
        <Map />
      </div>
    </div>
  );
}
