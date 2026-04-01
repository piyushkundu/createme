'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore, GameMode } from '../store/useGameStore';
import { pacifico } from './fonts';
import Leaderboard from '../components/Leaderboard';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const startGame = useGameStore(state => state.startGame);

  const handleStart = (mode: GameMode) => {
    if (name.trim()) {
      startGame(name.trim(), mode);
      router.push('/game');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center overflow-y-auto px-4 py-6 sm:py-6 w-full relative">
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-indigo-400/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/4 w-[50vw] h-[50vh] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-6xl z-10 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch lg:items-center relative pb-10">
        
        {/* LEFT COLUMN: GAME SELECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 bg-white/95 backdrop-blur-2xl p-5 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-200 relative flex-shrink-0"
        >
          <div className="text-center md:text-left mb-5 sm:mb-6 relative z-10">
            <motion.h1 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`${pacifico.className} text-4xl sm:text-5xl lg:text-6xl tracking-wide mb-2 leading-tight drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 inline-block`}
            >
              createme.in
            </motion.h1>
            <p className="text-slate-500 text-sm sm:text-base font-bold tracking-wide pl-1">The Premium India Map Challenge</p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div className="relative z-10 group">
              <label htmlFor="playerName" className="block text-xs font-bold text-slate-700 mb-1.5 ml-2 transition-colors group-focus-within:text-indigo-600">
                Explorer Name
              </label>
              <input
                id="playerName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleStart('states'); }}
                placeholder="Enter your name to begin..."
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-slate-50/80 backdrop-blur-md border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-400 text-base shadow-inner"
                required
                maxLength={20}
                autoComplete="off"
              />
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3">
              <p className="text-xs font-bold text-slate-700 col-span-full mb-0.5 ml-2">Choose Your Challenge</p>
              
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStart('states')}
                disabled={!name.trim()}
                className="w-full p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left flex flex-col justify-between min-h-[90px] sm:min-h-[110px]"
              >
                <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2 drop-shadow-md bg-white/20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg">🗺️</div>
                <div>
                  <h3 className="font-black text-base sm:text-lg tracking-tight leading-tight">Find The States</h3>
                  <p className="text-emerald-100 text-[10px] sm:text-xs font-semibold opacity-95">Locate all 28 states</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStart('uts')}
                disabled={!name.trim()}
                className="w-full p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left flex flex-col justify-between min-h-[90px] sm:min-h-[110px]"
              >
                <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2 drop-shadow-md bg-white/20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg">🏝️</div>
                <div>
                  <h3 className="font-black text-base sm:text-lg tracking-tight leading-tight">Union Territories</h3>
                  <p className="text-indigo-100 text-[10px] sm:text-xs font-semibold opacity-95">Find 8 regions</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStart('capitals')}
                disabled={!name.trim()}
                className="w-full p-3.5 sm:p-4 rounded-xl col-span-2 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_15px_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-3 sm:gap-4"
              >
                <div className="text-2xl sm:text-3xl drop-shadow-md bg-white/20 w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center rounded-xl">🏛️</div>
                <div>
                  <h3 className="font-black text-base sm:text-xl tracking-tight leading-tight">Find The Capitals</h3>
                  <p className="text-purple-100 text-xs sm:text-sm font-semibold opacity-95">Identify states by their capital city</p>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: LEADERBOARD */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
           className="lg:col-span-5 w-full flex-shrink-0 h-[450px] sm:h-[500px] lg:h-[600px]"
        >
          <Leaderboard compact={true} />
        </motion.div>
      </div>

      {/* Powered by Link */}
      <div className="mt-5 z-20">
        <a 
          href="https://knoblyweb.in" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-semibold flex items-center gap-1 drop-shadow-md"
          title="Visit Knobly Web"
        >
          Powered by <span className="text-slate-200 font-bold">Knobly</span>
        </a>
      </div>
    </div>
  );
}

