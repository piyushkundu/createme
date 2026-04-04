'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../../components/Map'), { 
  ssr: false, 
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
         <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-emerald-700 font-bold text-sm tracking-widest uppercase animate-pulse">Loading Map Engine...</p>
      </div>
    </div>
  ) 
});

const AsiaMap = dynamic(() => import('../../components/AsiaMap'), { 
  ssr: false, 
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
         <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-emerald-700 font-bold text-sm tracking-widest uppercase animate-pulse">Loading Asia Map Engine...</p>
      </div>
    </div>
  ) 
});
import GameUI from '../../components/GameUI';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamePage() {
  const router = useRouter();
  const { phase, playerName, elapsedTime, totalWrongAttempts, states, gameMode, isGuest, startGame } = useGameStore();

  useEffect(() => {
    if (phase === 'idle' || !playerName) {
      router.push('/');
    }
  }, [phase, router, playerName]);

  // Only render the game and the finish modal
  if (phase === 'idle') return null;

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {phase === 'playing' && <GameUI />}
      
      {/* Map container: fills entire screen */}
      <div className="absolute inset-0 z-0">
        {(gameMode === 'asia_countries' || gameMode === 'asia_capitals') ? <AsiaMap /> : <Map />}
      </div>

      {/* GAME OVER MODAL */}
      <AnimatePresence>
        {phase === 'finished' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl border border-white relative flex flex-col items-center justify-center m-4"
            >
              {/* Decorative Background */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center w-full">
                <span className="text-5xl sm:text-6xl mb-3 animate-bounce drop-shadow-md">🏆</span>
                
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1 tracking-tight">Game Complete!</h2>
                <p className="text-slate-500 text-sm font-bold mb-5">Excellent mapping, {playerName}!</p>

                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 space-y-3">
                  {/* Stats Row */}
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm">
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span>⏱️</span> Time Taken
                    </span>
                    <span className="text-base sm:text-lg font-black text-indigo-600">{elapsedTime}s</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm">
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span>✅</span> Total Correct
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-600">{states.length}/{states.length}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm">
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span>❌</span> Wrong Attempts
                    </span>
                    <span className="text-base sm:text-lg font-black text-rose-500">{totalWrongAttempts}</span>
                  </div>

                  {/* Optional Score Calculation */}
                  <div className="flex justify-between items-center bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 mt-2">
                    <span className="text-[11px] sm:text-xs font-black text-indigo-800 uppercase tracking-wider">
                      Accuracy
                    </span>
                    <span className="text-base sm:text-lg font-black text-indigo-600">
                      {Math.max(0, Math.round(((states.length) / (states.length + totalWrongAttempts)) * 100))}%
                    </span>
                  </div>
                </div>

                <div className="w-full flex-col space-y-2">
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => startGame(playerName, gameMode, isGuest)}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      🔄 Play Again
                    </button>
                    <button
                      onClick={() => router.push('/leaderboard')}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      📊 View Ranks
                    </button>
                  </div>

                  <button
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors active:scale-95"
                  >
                    🏠 Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
