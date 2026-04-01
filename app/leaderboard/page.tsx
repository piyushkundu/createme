'use client';

import { useRouter } from 'next/navigation';
import Leaderboard from '../../components/Leaderboard';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-12 w-full relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/30 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="self-start sm:ml-[10%] mb-8 px-6 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-700 hover:border-indigo-300 transition-all flex items-center gap-2 relative z-10"
      >
        <span className="text-xl text-indigo-500 group-hover:text-indigo-600">←</span> Play Again
      </motion.button>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Leaderboard />
      </motion.div>
      
    </div>
  );
}
