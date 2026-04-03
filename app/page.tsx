'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, GameMode } from '../store/useGameStore';
import { pacifico } from './fonts';
import Leaderboard from '../components/Leaderboard';
import { loginOrRegister } from '../lib/gameEngine';
import { validateUsernameAction } from './actions/validateUsername';

// Icons for Password Toggle
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function Home() {
  // Authentication & Presentation States
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  
  // Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();
  const startGame = useGameStore(state => state.startGame);

  // Pre-fetch map data silently so game page loads instantly
  useEffect(() => {
    fetch('/api/map').catch(() => {});
  }, []);

  // Modal Login Logic
  const handleLoginSubmit = async () => {
    if (!name.trim() || !pin.trim()) {
      setErrorMsg("Please enter both Username and PIN.");
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMsg('Verifying Username Safely...');

      // Run AI validation before login/register
      const aiCheck = await validateUsernameAction(name.trim());
      
      if (!aiCheck.is_clean) {
        setErrorMsg(`Username rejected: ${aiCheck.reason || "Inappropriate content detected"}`);
        setIsLoading(false);
        return;
      }

      setErrorMsg(''); // clear after success
      await loginOrRegister(name.trim(), pin.trim());
      setIsGuest(false);
      setShowAuthModal(false); // Success! Close the modal.
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  // Game Launcher Logic
  const handleStart = (mode: GameMode) => {
    if (isGuest) {
      startGame("Guest Explorer", mode, true);
    } else {
      startGame(name.trim(), mode, false);
    }
    router.push('/game');
  };

  const isFormValid = name.trim().length > 0 && pin.trim().length > 0;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-100 relative p-3 sm:p-4 lg:py-6 lg:px-6 w-full custom-scrollbar">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-400/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-6xl h-full flex flex-col gap-3 sm:gap-4 z-10 relative">
        
        {/* TOP HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-[2rem] px-5 sm:px-6 py-3 sm:py-4 border border-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
        >
          <div className="text-center sm:text-left flex items-center justify-center sm:justify-start">
            <div>
              <h1 className={`${pacifico.className} text-3xl sm:text-4xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 inline-block drop-shadow-sm`}>
                createme.in
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-bold tracking-wide mt-0.5 ml-1">The Premium India Map Challenge</p>
            </div>
          </div>

          {/* DYNAMIC HEADER BUTTON */}
          <div className="flex justify-center">
            {isGuest ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:via-orange-600 hover:to-rose-600 text-white text-[13px] sm:text-sm font-black tracking-wide rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all flex items-center gap-2.5 group border border-orange-300/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0),45%,rgba(255,255,255,0.4),55%,rgba(255,255,255,0))] bg-[length:200%_100%] animate-pulse" />
                <span className="relative z-10 drop-shadow-md">🔐</span>
                <span className="relative z-10 drop-shadow-sm uppercase tracking-widest text-xs hidden sm:inline">Sign In To Compete</span>
                <span className="relative z-10 drop-shadow-sm uppercase tracking-widest text-xs sm:hidden">Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-extrabold rounded-2xl shadow-sm flex items-center gap-2">
                  <span>🏆</span>
                  <span>Welcome, {name}!</span>
                </div>
                <button
                  onClick={() => setIsGuest(true)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* MAIN SPLIT CONTENT */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 flex-1 min-h-0 h-full w-full">
          
          {/* LEFT SIDE: BANNER + GAME MODES */}
          <div className="flex-[0.9] flex flex-col gap-3 sm:gap-4 min-h-0 h-full w-full">
            
            {/* SLIM STATUS BANNER */}
            <motion.div 
              layout
              className={`backdrop-blur-xl rounded-[2rem] border shadow-md shrink-0 p-5 sm:p-6 flex items-center gap-4 transition-colors duration-500 ${isGuest ? 'bg-slate-50/90 border-slate-200' : 'bg-emerald-50/90 border-emerald-200'}`}
            >
              <div className="text-4xl sm:text-5xl animate-bounce">
                {isGuest ? '🎈' : '🔥'}
              </div>
              <div>
                <h3 className={`font-black text-xl mb-1 ${isGuest ? 'text-slate-700' : 'text-emerald-700'}`}>
                  {isGuest ? 'Guest Mode Active' : 'Competition Mode Active'}
                </h3>
                <p className={`text-xs sm:text-sm font-bold leading-relaxed ${isGuest ? 'text-slate-500' : 'text-emerald-600/80'}`}>
                  {isGuest 
                    ? "You are playing for fun! Your scores will not be plotted on the Leaderboard." 
                    : "Your scores will be automatically saved to the Leaderboard! Go claim that #1 spot."}
                </p>
              </div>
            </motion.div>



            {/* BUTTONS ROW (STACKED PREMIUM) */}
            <motion.div 
               layout
               className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl p-4 sm:p-5 shrink-0"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase font-extrabold text-slate-800 tracking-widest ml-2">Select Map Engine</h2>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  onClick={() => handleStart('states')}
                  className="w-full p-4 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-white hover:to-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1.5 group relative overflow-hidden"
                >
                  <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform">🗺️</span>
                  <span className="font-extrabold text-[13px] tracking-tight group-hover:text-emerald-700 transition-colors">Find States</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600/70 transition-colors">Locate all 28 states</span>
                </button>
                <button
                  onClick={() => handleStart('uts')}
                  className="w-full p-4 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-white hover:to-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1.5 group relative overflow-hidden"
                >
                  <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform">🏝️</span>
                  <span className="font-extrabold text-[13px] tracking-tight group-hover:text-blue-700 transition-colors">Find UTs</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600/70 transition-colors">Find 8 territories</span>
                </button>
                <button
                  onClick={() => handleStart('capitals')}
                  className="w-full p-4 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-white hover:to-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1.5 group relative overflow-hidden sm:col-span-2 lg:col-span-1"
                >
                  <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform">🏛️</span>
                  <span className="font-extrabold text-[13px] tracking-tight group-hover:text-purple-700 transition-colors">Find Capitals</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-600/70 transition-colors">Pinpoint 36 cities</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: LEADERBOARD */}
          <div className="flex-[1.2] w-full min-h-0 h-full overflow-hidden shrink-0">
            <Leaderboard compact={true} />
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-slate-400 text-[11px] sm:text-xs font-bold shrink-0">
          Powered by <a href="https://knoblyweb.in" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-400 transition-colors">Knobly</a>
        </p>
      </div>

      {/* --- MODAL POPUP FOR AUTHENTICATION --- */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
            onClick={() => !isLoading && setShowAuthModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent close on modal click
              className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white relative overflow-hidden"
            >
              {/* Decorative Modal Background Component */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full opacity-50 pointer-events-none" />
              
              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)} disabled={isLoading}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors font-bold disabled:opacity-50"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black text-slate-800 mb-1">Sign In</h2>
              <p className="text-slate-500 text-xs font-bold mb-6">Create an account or login to save scores.</p>

              <div className="space-y-4 relative z-10">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1.5 ml-1">Explorer Username</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MapMaster99"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-400 text-sm"
                    maxLength={16}
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1.5 ml-1 flex justify-between">
                    <span>Secret PIN</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={pin} onChange={(e) => setPin(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && isFormValid) handleLoginSubmit(); }}
                      placeholder="••••••••"
                      className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-400 text-lg tracking-widest"
                      maxLength={8}
                    />
                    {/* View Password Toggle */}
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 rounded-xl"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                
                {/* Warning Message */}
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mt-4">
                  <p className="text-[11px] text-rose-700 font-bold leading-snug">
                    <span className="text-rose-500 mr-1 uppercase tracking-wider">⚠️ Important:</span>
                    Forgotten PINs are <span className="underline decoration-rose-300 decoration-2">unrecoverable</span>. Keep it safe!
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-rose-600 text-xs font-bold text-center mt-2 animate-bounce">{errorMsg}</p>
                )}

                <button
                  onClick={handleLoginSubmit} disabled={!isFormValid || isLoading}
                  className="w-full p-4 mt-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center font-extrabold tracking-wide"
                >
                  {isLoading ? 'Verifying Account...' : 'Verify & Login'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
