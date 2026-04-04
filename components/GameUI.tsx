'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import Timer from './Timer';
import { pacifico } from '../app/fonts';

export default function GameUI() {
  const { states, currentIndex, wrongAttempts, phase, gameMode } = useGameStore();
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`;
      }
    };
    if (phase === 'playing') {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [phase]);

  if (phase !== 'playing') return null;

  const targetState = states[currentIndex];
  const progress = states.length > 0 ? Math.round((currentIndex / states.length) * 100) : 0;

  return (
    <>
      {/* ── Desktop cursor label ── */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden md:block bg-white text-slate-800 px-3 py-1.5 rounded shadow-md border border-slate-200 whitespace-nowrap text-sm font-bold"
        style={{ transform: 'translate(-100px, -100px)' }}
      >
        {gameMode === 'capitals' || gameMode === 'asia_capitals'
          ? `Locate capital: ${targetState?.capital}`
          : `Click on ${targetState?.name}`}
      </div>

      {/* ═══════════════════════════════════
          TOP BAR — ultra compact on mobile
      ═══════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-2.5 sm:px-5 pt-2 pb-1.5 sm:py-3 gap-2 pointer-events-none">

        {/* Logo */}
        <div className="flex items-center pointer-events-auto">
          <h1 className={`${pacifico.className} text-base sm:text-3xl md:text-5xl [filter:drop-shadow(0_1px_2px_#ffffff)] tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-700 cursor-pointer leading-none`}>
            createme.in
          </h1>
        </div>

        {/* Consolidated HUD: Attempts + Timer (Top) & Progress (Bottom) */}
        <div className="flex flex-col gap-2 sm:gap-3 bg-white/95 backdrop-blur-xl p-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xl pointer-events-auto">
          
          {/* Top Row: Attempts & Timer */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Attempts dots */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none hidden sm:block">Attempts</span>
              <div className="flex gap-1 mt-[2px]">
                {[0, 1, 2].map((idx) => (
                  <motion.div
                    key={idx}
                    animate={idx < wrongAttempts ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      idx < wrongAttempts
                        ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                        : 'bg-slate-200 border border-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="w-px h-6 sm:h-8 bg-slate-200 hidden sm:block" />
            
            <Timer />
          </div>

          {/* Bottom Row: Progress Tracker */}
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg shadow-sm">
            <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Progress</span>
            <div className="flex-1 w-16 sm:w-24 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[8px] sm:text-[10px] text-slate-500 font-bold tabular-nums">
              {currentIndex}/{states.length}
            </span>
          </div>
          
        </div>
      </div>

      {/* ═══════════════════════════════════
          TARGET CARD
          Desktop: right-center floating
          Mobile:  bottom pill (compact)
      ═══════════════════════════════════ */}

      {/* Desktop */}
      <div className="hidden md:block fixed top-1/2 right-6 -translate-y-1/2 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={targetState?.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative pointer-events-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-white/95 backdrop-blur-xl px-7 py-5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col items-center gap-1 min-w-[175px]">
              <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-[0.2em] text-center w-full block">
                {gameMode === 'states' ? 'Find this state' : 
                 gameMode === 'uts' ? 'Find this UT' : 
                 gameMode === 'asia_countries' ? 'Find this country' : 
                 'Locate capital'}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 text-center leading-tight drop-shadow-sm">
                {gameMode === 'capitals' || gameMode === 'asia_capitals' ? targetState?.capital : targetState?.name}
              </h2>
              {wrongAttempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    wrongAttempts >= 3
                      ? 'bg-rose-100/80 text-rose-600 border border-rose-200'
                      : 'bg-amber-100/80 text-amber-600 border border-amber-200'
                  }`}
                >
                  {wrongAttempts >= 3 ? '✗ Wrong — watch it blink!' : `✗ ${wrongAttempts} wrong`}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile — compact pill at bottom */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-5rem)] max-w-xs pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={targetState?.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 rounded-2xl blur-md" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.1)] px-4 py-2.5 flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-extrabold text-indigo-600 uppercase tracking-[0.18em]">
                  {gameMode === 'states' ? 'Find this state' : 
                   gameMode === 'uts' ? 'Find this UT' : 
                   gameMode === 'asia_countries' ? 'Find this country' : 
                   'Locate capital'}
                </span>
                <h2 className="text-base font-black text-slate-800 leading-tight">
                  {gameMode === 'capitals' || gameMode === 'asia_capitals' ? targetState?.capital : targetState?.name}
                </h2>
                {wrongAttempts > 0 && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 border ${
                    wrongAttempts >= 3
                      ? 'bg-rose-100/80 text-rose-600 border-rose-200'
                      : 'bg-amber-100/80 text-amber-600 border-amber-200'
                  }`}>
                    {wrongAttempts >= 3 ? '✗ Watch it blink!' : `✗ ${wrongAttempts} wrong`}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
