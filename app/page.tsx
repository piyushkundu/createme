'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, GameMode } from '../store/useGameStore';
import Leaderboard from '../components/Leaderboard';

/* ─── Tiny Win2k UI primitives ─────────────────────────────── */

function TitleBar({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="win-titlebar flex items-center justify-between px-2 py-[3px] select-none">
      <div className="flex items-center gap-1.5">
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '0.01em' }}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-[2px]">
        {['_', '□', '✕'].map((c, i) => (
          <button
            key={i}
            aria-label={['Minimise', 'Maximise', 'Close'][i]}
            style={{
              width: 16,
              height: 14,
              fontSize: 9,
              background: '#d4d0c8',
              border: '2px solid',
              borderColor: '#ffffff #808080 #808080 #ffffff',
              boxShadow: '1px 1px 0 #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
              color: '#000',
              lineHeight: 1,
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function Win2kButton({
  children,
  onClick,
  disabled,
  fullWidth,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'primary';
}) {
  const [pressed, setPressed] = useState(false);

  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    background: '#d4d0c8',
    border: '2px solid',
    borderColor: pressed ? '#808080 #ffffff #ffffff #808080' : '#ffffff #808080 #808080 #ffffff',
    boxShadow: pressed ? 'inset 1px 1px 0 #000' : '1px 1px 0 #000',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: disabled ? '#808080' : '#000',
    padding: '6px 10px',
    userSelect: 'none',
    width: fullWidth ? '100%' : undefined,
    minHeight: 88,
    textAlign: 'left',
  };

  return (
    <button
      style={base}
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {children}
    </button>
  );
}

function Win2kInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: React.KeyboardEventHandler;
  placeholder?: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      maxLength={20}
      autoComplete="off"
      style={{
        width: '100%',
        background: '#ffffff',
        border: '2px solid',
        borderColor: '#808080 #ffffff #ffffff #808080',
        boxShadow: 'inset 1px 1px 0 #000',
        fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
        fontSize: 11,
        padding: '4px 6px',
        outline: 'none',
        color: '#000',
      }}
    />
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */

export default function Home() {
  const [name, setName] = useState('');
  const [clockTime, setClockTime] = useState('');
  const router = useRouter();
  const startGame = useGameStore(state => state.startGame);

  // Update clock only on the client to avoid SSR/hydration mismatch
  useEffect(() => {
    const tick = () =>
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleStart = (mode: GameMode) => {
    if (name.trim()) {
      startGame(name.trim(), mode);
      router.push('/game');
    }
  };

  const modes: { mode: GameMode; icon: string; label: string; sub: string; wide?: boolean }[] = [
    { mode: 'states',   icon: '🗺️', label: 'Find The States',   sub: 'Locate all 28 states on the map' },
    { mode: 'uts',      icon: '🏝️', label: 'Union Territories', sub: 'Find all 8 union territories' },
    { mode: 'capitals', icon: '🏛️', label: 'Find The Capitals', sub: 'Identify states by their capital city', wide: true },
  ];

  return (
    <div
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: 12 }}
    >
      {/* ── Desktop "taskbar" hint ─── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 28, background: '#d4d0c8', borderTop: '2px solid #ffffff', display: 'flex', alignItems: 'center', paddingLeft: 4, gap: 4, zIndex: 50 }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#d4d0c8', border: '2px solid',
            borderColor: '#ffffff #808080 #808080 #ffffff',
            boxShadow: '1px 1px 0 #000',
            fontFamily: "'Tahoma', Arial, sans-serif",
            fontWeight: 900, fontSize: 11,
            padding: '2px 8px', cursor: 'pointer', userSelect: 'none',
          }}
        >
          <span style={{ fontSize: 14 }}>🪟</span> Start
        </button>
        <div style={{ width: 1, height: '70%', background: '#808080', marginLeft: 2 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: '#d4d0c8', border: '2px solid',
          borderColor: '#808080 #ffffff #ffffff #808080',
          boxShadow: 'inset 1px 1px 0 #000',
          fontFamily: "'Tahoma', Arial, sans-serif",
          fontSize: 10, padding: '2px 8px',
        }}>
          🗺️ createme.in — India Map Challenge
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingRight: 6 }}>
          <span style={{ fontSize: 10, color: '#444' }}>🔊</span>
          <div style={{
            background: '#d4d0c8', border: '2px solid',
            borderColor: '#808080 #ffffff #ffffff #808080',
            boxShadow: 'inset 1px 1px 0 #000',
            fontSize: 9, padding: '1px 5px', fontFamily: "'Tahoma', Arial, sans-serif",
          }}>
            {clockTime}
          </div>
        </div>
      </div>

      {/* ── Main "window" grid ── */}
      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>

        {/* ── Window: Game Setup ── */}
        <div style={{ background: '#d4d0c8', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', boxShadow: '2px 2px 0 #000' }}>
          <TitleBar title="createme.in — India Map Challenge" icon="🗺️" />

          {/* menu bar */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #808080', background: '#d4d0c8', padding: '2px 4px' }}>
            {['File', 'Game', 'Help'].map(m => (
              <button key={m} style={{ background: 'none', border: 'none', fontFamily: "'Tahoma', Arial, sans-serif", fontSize: 11, padding: '1px 6px', cursor: 'default' }}>
                {m}
              </button>
            ))}
          </div>

          {/* toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderBottom: '1px solid #808080', background: '#d4d0c8' }}>
            {[{ icon: '▶', label: 'Play' }, { icon: '⏹', label: 'Stop' }, { icon: '❓', label: 'Help' }].map(t => (
              <button key={t.label} title={t.label} style={{ background: '#d4d0c8', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', boxShadow: '1px 1px 0 #000', width: 24, height: 22, cursor: 'pointer', fontFamily: 'Arial', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.icon}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: '#808080', margin: '0 2px' }} />
            <span style={{ fontSize: 10, color: '#444' }}>Welcome, Explorer!</span>
          </div>

          {/* client area */}
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Explorer Name group box */}
            <fieldset style={{ border: '1px solid #808080', padding: '8px 10px 10px', margin: 0, background: '#d4d0c8' }}>
              <legend style={{ fontFamily: "'Tahoma', Arial, sans-serif", fontSize: 11, fontWeight: 700, padding: '0 4px' }}>
                Explorer Profile
              </legend>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <label htmlFor="playerName" style={{ fontFamily: "'Tahoma', Arial, sans-serif", fontSize: 11, whiteSpace: 'nowrap' }}>
                  Player &amp;Name:
                </label>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <Win2kInput
                    id="playerName"
                    value={name}
                    onChange={setName}
                    onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleStart('states'); }}
                    placeholder="Enter your name..."
                  />
                </div>
              </div>
            </fieldset>

            {/* Game Mode group box */}
            <fieldset style={{ border: '1px solid #808080', padding: '8px 10px 10px', margin: 0, background: '#d4d0c8' }}>
              <legend style={{ fontFamily: "'Tahoma', Arial, sans-serif", fontSize: 11, fontWeight: 700, padding: '0 4px' }}>
                Select Game Mode
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {modes.map(({ mode, icon, label, sub, wide }) => (
                  <Win2kButton
                    key={mode}
                    onClick={() => handleStart(mode)}
                    disabled={!name.trim()}
                    fullWidth
                    style={wide ? { gridColumn: '1 / -1' } as React.CSSProperties : undefined}
                  >
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 11 }}>{label}</div>
                      <div style={{ color: '#444444', fontSize: 10, fontWeight: 400 }}>{sub}</div>
                    </div>
                  </Win2kButton>
                ))}
              </div>
              {!name.trim() && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <span style={{ fontFamily: "'Tahoma', Arial, sans-serif", fontSize: 10, color: '#444' }}>
                    Please enter your name above to enable game modes.
                  </span>
                </div>
              )}
            </fieldset>

          </div>

          {/* status bar */}
          <div style={{ display: 'flex', gap: 4, padding: '3px 6px', borderTop: '1px solid #808080', background: '#d4d0c8' }}>
            <div style={{ flex: 1, border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '1px 4px', fontSize: 10, fontFamily: "'Tahoma', Arial, sans-serif" }}>
              Ready
            </div>
            <div style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '1px 8px', fontSize: 10, fontFamily: "'Tahoma', Arial, sans-serif" }}>
              3 Game Modes
            </div>
            <div style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '1px 8px', fontSize: 10, fontFamily: "'Tahoma', Arial, sans-serif" }}>
              🌐 createme.in
            </div>
          </div>
        </div>

        {/* ── Window: Leaderboard ── */}
        <div style={{ background: '#d4d0c8', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', boxShadow: '2px 2px 0 #000' }}>
          <TitleBar title="Top Explorers — Leaderboard" icon="🏆" />
          <div style={{ padding: 12 }}>
            <Leaderboard compact={false} />
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '3px 6px', borderTop: '1px solid #808080', background: '#d4d0c8' }}>
            <div style={{ flex: 1, border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '1px 4px', fontSize: 10, fontFamily: "'Tahoma', Arial, sans-serif" }}>
              Fastest completion times
            </div>
          </div>
        </div>

        {/* ── Powered-by strip ── */}
        <div style={{ textAlign: 'center', fontSize: 10, fontFamily: "'Tahoma', Arial, sans-serif", color: '#ffffff', paddingBottom: 36 }}>
          Powered by{' '}
          <a href="https://knoblyweb.in" target="_blank" rel="noopener noreferrer" style={{ color: '#ffff80', fontWeight: 700 }}>
            Knobly Web
          </a>
          {' '}— Best viewed in Internet Explorer 6.0 at 800×600 resolution
        </div>
      </div>
    </div>
  );
}
