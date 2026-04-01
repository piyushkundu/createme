'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../lib/gameEngine';
import { GameMode } from '../store/useGameStore';

const WIN_STYLE: React.CSSProperties = {
  fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
  fontSize: 11,
};

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
    { id: 'states',   label: 'States'   },
    { id: 'uts',      label: 'UTs'      },
    { id: 'capitals', label: 'Capitals' },
  ];

  return (
    <div style={{ ...WIN_STYLE, display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid #808080' }}>
        {modes.map(({ id, label }) => {
          const active = activeMode === id;
          return (
            <button
              key={id}
              onClick={() => setActiveMode(id)}
              style={{
                ...WIN_STYLE,
                padding: '3px 12px',
                cursor: 'pointer',
                fontWeight: active ? 700 : 400,
                background: active ? '#d4d0c8' : '#b8b4ac',
                border: '2px solid',
                borderColor: active
                  ? '#ffffff #808080 #d4d0c8 #ffffff'
                  : '#ffffff #808080 #808080 #ffffff',
                borderBottom: active ? '2px solid #d4d0c8' : '2px solid #808080',
                boxShadow: active ? '0 -1px 0 #000 inset' : 'none',
                marginBottom: active ? -2 : 0,
                zIndex: active ? 1 : 0,
                position: 'relative',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* List view container */}
      <div style={{
        background: '#ffffff',
        border: '2px solid',
        borderColor: '#808080 #ffffff #ffffff #808080',
        boxShadow: 'inset 1px 1px 0 #000',
        minHeight: 200,
        maxHeight: compact ? 320 : 420,
        overflowY: 'auto',
      }}
        className="win-scroll"
      >
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr auto auto',
          background: '#d4d0c8',
          borderBottom: '1px solid #808080',
          padding: '2px 4px',
        }}>
          {['#', 'Name', 'Date', 'Time'].map(h => (
            <div key={h} style={{
              ...WIN_STYLE,
              fontWeight: 700,
              padding: '2px 6px',
              borderRight: h !== 'Time' ? '1px solid #808080' : 'none',
            }}>
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '12px 8px', ...WIN_STYLE, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: 20, background: '#e4e0d8', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', ...WIN_STYLE, color: '#444' }}>
            No times recorded yet. Be the first!
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={entry.id || idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr auto auto',
                padding: '3px 4px',
                background: idx % 2 === 0 ? '#ffffff' : '#f0ede8',
                borderBottom: '1px solid #e0dcd5',
                cursor: 'default',
              }}
            >
              <div style={{ ...WIN_STYLE, padding: '2px 6px', color: idx === 0 ? '#b8960c' : idx === 1 ? '#555' : idx === 2 ? '#a0522d' : '#000', fontWeight: idx < 3 ? 700 : 400 }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </div>
              <div style={{ ...WIN_STYLE, padding: '2px 6px', fontWeight: idx < 3 ? 700 : 400 }}>{entry.name}</div>
              <div style={{ ...WIN_STYLE, padding: '2px 10px', color: '#555' }}>{new Date(entry.date).toLocaleDateString()}</div>
              <div style={{ ...WIN_STYLE, padding: '2px 8px', fontFamily: "'Courier New', monospace", fontWeight: 700, color: '#0a246a' }}>
                {formatTime(entry.time)}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ ...WIN_STYLE, fontSize: 10, color: '#555', textAlign: 'right' }}>
        {entries.length} record{entries.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
}
