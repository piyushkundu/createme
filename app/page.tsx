'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, GameMode } from '../store/useGameStore';
import Leaderboard from '../components/Leaderboard';

function CreateMeLogo() {
  return (
    <span 
      className="font-[var(--font-cursive)] text-3xl bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm"
      style={{ letterSpacing: '0.02em' }}
    >
      createme.in
    </span>
  );
}

export default function Home() {
  const [name, setName] = useState('');
  const [hoveredMode, setHoveredMode] = useState<GameMode | null>(null);
  const router = useRouter();
  const startGame = useGameStore(state => state.startGame);

  const handleStart = (mode: GameMode) => {
    if (name.trim()) {
      startGame(name.trim(), mode);
      router.push('/game');
    }
  };

  const modes: { mode: GameMode; icon: React.ReactNode; label: string; description: string }[] = [
    { 
      mode: 'states',   
      icon: <MapIcon />,
      label: 'Find The States',   
      description: 'Locate all 28 states on the map' 
    },
    { 
      mode: 'uts',      
      icon: <IslandIcon />,
      label: 'Union Territories', 
      description: 'Find all 8 union territories' 
    },
    { 
      mode: 'capitals', 
      icon: <BuildingIcon />,
      label: 'Find The Capitals', 
      description: 'Identify states by their capital city'
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <CreateMeLogo />
            </div>
            <nav className="hidden sm:flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Game</a>
              <a href="#leaderboard" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Leaderboard</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">About</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto w-full">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-sm font-medium">India Map Challenge</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance mb-4">
              Master Indian Geography
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto text-pretty">
              Test your knowledge of Indian states, union territories, and capitals. 
              Race against time and compete on the leaderboard.
            </p>
          </div>

          {/* Name Input Card */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
            <label htmlFor="playerName" className="block text-sm font-medium text-muted-foreground mb-2">
              Enter your name to begin
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="playerName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleStart('states'); }}
                placeholder="Your name..."
                maxLength={20}
                autoComplete="off"
                className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Game Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {modes.map(({ mode, icon, label, description }) => {
              const isHovered = hoveredMode === mode;
              const isDisabled = !name.trim();
              
              return (
                <button
                  key={mode}
                  onClick={() => handleStart(mode)}
                  onMouseEnter={() => setHoveredMode(mode)}
                  onMouseLeave={() => setHoveredMode(null)}
                  disabled={isDisabled}
                  className={`
                    group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                    ${isDisabled 
                      ? 'bg-muted border border-border cursor-not-allowed opacity-50' 
                      : 'bg-card border border-border hover:border-accent/50 hover:bg-accent/5 cursor-pointer'
                    }
                  `}
                >
                  {/* Glow effect */}
                  {!isDisabled && isHovered && (
                    <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
                  )}
                  
                  <div className="relative z-10">
                    <div className={`
                      w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors
                      ${isDisabled ? 'bg-border text-muted-foreground' : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'}
                    `}>
                      {icon}
                    </div>
                    <h3 className="text-foreground font-semibold text-lg mb-1">{label}</h3>
                    <p className="text-muted-foreground text-sm">{description}</p>
                  </div>

                  {/* Arrow indicator */}
                  {!isDisabled && (
                    <div className={`
                      absolute bottom-6 right-6 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center
                      transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                    `}>
                      <ArrowRightIcon className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Helper text */}
          {!name.trim() && (
            <div className="text-center mb-12">
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                <InfoIcon className="w-4 h-4" />
                Enter your name above to unlock game modes
              </p>
            </div>
          )}

          {/* Leaderboard Section */}
          <div id="leaderboard" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold text-xl">Leaderboard</h2>
                <p className="text-muted-foreground text-sm">Top explorers ranked by completion time</p>
              </div>
            </div>
            <Leaderboard compact={false} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Powered by</span>
            <span className="ml-1.5 font-semibold text-foreground">Knobly</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Logo */
/* Icons */
function MapIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function IslandIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-2.927 0" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}
