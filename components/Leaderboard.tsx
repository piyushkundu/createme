'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeaderboard, LeaderboardEntry } from '../lib/gameEngine';
import { GameMode } from '../store/useGameStore';

export default function Leaderboard({ compact = false }: { compact?: boolean }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<GameMode>('states');

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      const data = await getLeaderboard(activeMode);
      setEntries(data);
      setLoading(false);
    };
    fetchBoard();
  }, [activeMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full mx-auto bg-white/95 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-slate-200 relative ${compact ? 'max-w-none shadow-lg h-full flex flex-col' : 'max-w-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]'}`}>
      {!compact && <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-[80px] pointer-events-none" />}
      <div className={`${compact ? 'p-6 pb-4' : 'p-8 pb-6'} text-center bg-gradient-to-b from-slate-50 to-white relative z-10 shrink-0`}>
        <h2 className="text-3xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">Top Explorers</h2>
        <p className="text-sm font-medium text-slate-500">Fastest times on the India Map Challenge</p>
      </div>

      <div className="flex border-y border-slate-200 bg-slate-50 relative z-10 w-full shrink-0">
        {(['states', 'uts', 'capitals'] as GameMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-all ${activeMode === mode ? 'text-indigo-600 bg-white shadow-[inset_0_-2px_0_0_#4f46e5]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}
          >
            {mode === 'states' ? 'States' : mode === 'uts' ? 'UTs' : 'Capitals'}
          </button>
        ))}
      </div>

      <div className={`p-4 ${compact ? 'sm:p-6 overflow-hidden flex-1 flex flex-col min-h-0' : 'sm:p-8'}`}>
        {loading ? (
          <div className="space-y-4 relative z-10 overflow-hidden flex-1 min-h-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-100 rounded-xl animate-pulse border border-slate-200 shrink-0"></div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-bold relative z-10 min-h-0">No times recorded yet. Be the first!</div>
        ) : (
          <div className={`${compact ? 'overflow-y-auto h-full flex-1 min-h-0' : 'max-h-[50vh] overflow-y-auto'} pr-2 custom-scrollbar relative z-10`}>
            <AnimatePresence>
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 mb-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-xl ${
                      idx === 0 ? 'bg-amber-100 text-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.3)]' :
                      idx === 1 ? 'bg-slate-200 text-slate-600 shadow-[0_0_15px_rgba(148,163,184,0.3)]' :
                      idx === 2 ? 'bg-orange-100 text-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-xl group-hover:text-indigo-600 transition-colors tracking-tight">{entry.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-bold">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-indigo-700 font-mono font-bold text-lg border border-slate-200 shadow-inner">
                    {formatTime(entry.time)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
