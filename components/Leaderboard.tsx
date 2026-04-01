'use client';

import { useEffect, useState } from 'react';
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

  const modes: { id: GameMode; label: string }[] = [
    { id: 'states',   label: 'States' },
    { id: 'uts',      label: 'UTs' },
    { id: 'capitals', label: 'Capitals' },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {modes.map(({ id, label }) => {
          const active = activeMode === id;
          return (
            <button
              key={id}
              onClick={() => setActiveMode(id)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                ${active 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[48px_1fr_100px_80px] gap-2 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/50">
        <span>#</span>
        <span>Player</span>
        <span>Date</span>
        <span className="text-right">Time</span>
      </div>

      {/* Table Body */}
      <div className={`${compact ? 'max-h-[300px]' : 'max-h-[400px]'} overflow-y-auto`}>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 rounded-lg animate-shimmer" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No times recorded yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Be the first to complete the challenge!</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={entry.id || idx}
              className={`
                grid grid-cols-[48px_1fr_100px_80px] gap-2 px-4 py-3 items-center
                ${idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                hover:bg-accent/5 transition-colors
              `}
            >
              {/* Rank */}
              <span className="flex items-center justify-center">
                {idx === 0 ? (
                  <span className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-sm">1</span>
                ) : idx === 1 ? (
                  <span className="w-7 h-7 rounded-full bg-gray-400/20 flex items-center justify-center text-gray-400 text-sm">2</span>
                ) : idx === 2 ? (
                  <span className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-sm">3</span>
                ) : (
                  <span className="text-muted-foreground text-sm">{idx + 1}</span>
                )}
              </span>

              {/* Name */}
              <span className={`font-medium truncate ${idx < 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {entry.name}
              </span>

              {/* Date */}
              <span className="text-muted-foreground text-sm">
                {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>

              {/* Time */}
              <span className={`
                text-right font-mono font-semibold
                ${idx < 3 ? 'text-accent' : 'text-foreground'}
              `}>
                {formatTime(entry.time)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-muted-foreground text-xs">
            {entries.length} player{entries.length !== 1 ? 's' : ''} on the leaderboard
          </p>
        </div>
      )}
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-2.927 0" />
    </svg>
  );
}
