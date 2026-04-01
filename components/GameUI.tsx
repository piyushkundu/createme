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
        {gameMode === 'capitals'
          ? `State with capital: ${targetState?.capital}`
          : `Click on ${targetState?.name}`}
      </div>

      {/* ═══════════════════════════════════
          TOP BAR — ultra compact on mobile
      ═══════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-2.5 sm:px-5 pt-2 pb-1.5 sm:py-3 gap-2 pointer-events-none">

        {/* Logo + progress */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <h1 className={`${pacifico.className} text-base sm:text-3xl md:text-4xl drop-shadow-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 cursor-pointer leading-none`}>
            createme.in
          </h1>
          <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-full px-2 py-0.5 sm:px-3 sm:py-1.5 shadow">
            <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[8px] sm:text-[10px] text-slate-400 font-semibold whitespace-nowrap">
              {currentIndex}/{states.length}
            </span>
          </div>
        </div>

        {/* Attempts + Timer */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/80 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl pointer-events-auto">
          {/* Attempts dots */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[7px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none hidden sm:block">Attempts</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((idx) => (
                <motion.div
                  key={idx}
                  animate={idx < wrongAttempts ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                    idx < wrongAttempts
                      ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]'
                      : 'bg-slate-600 border border-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-px h-5 sm:h-7 bg-white/10 hidden sm:block" />
          <Timer />
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-slate-900/85 backdrop-blur-xl px-7 py-5 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/12 flex flex-col items-center gap-1 min-w-[175px]">
              <span className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-[0.2em] text-center w-full block">
                {gameMode === 'states' ? 'Find this state' : gameMode === 'uts' ? 'Find this UT' : 'Locate state with capital'}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white text-center leading-tight drop-shadow-md">
                {gameMode === 'capitals' ? targetState?.capital : targetState?.name}
              </h2>
              {wrongAttempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    wrongAttempts >= 3
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-cyan-500/15 rounded-2xl blur-md" />
              <div className="relative bg-slate-900/92 backdrop-blur-xl rounded-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.7)] px-4 py-2.5 flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-bold text-indigo-400/90 uppercase tracking-[0.18em]">
                  {gameMode === 'states' ? 'Find this state' : gameMode === 'uts' ? 'Find this UT' : 'State with capital'}
                </span>
                <h2 className="text-base font-black text-white leading-tight">
                  {gameMode === 'capitals' ? targetState?.capital : targetState?.name}
                </h2>
                {wrongAttempts > 0 && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${
                    wrongAttempts >= 3
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
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
