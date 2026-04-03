import { create } from 'zustand';
import statesData from '../data/states.json';
import { shuffleArray, saveResult } from '../lib/gameEngine';

export interface StateData {
  id: string;
  name: string;
  type: string;
  capital: string;
}

export type GameMode = 'states' | 'uts' | 'capitals';

interface GameState {
  states: StateData[];
  currentIndex: number;
  wrongAttempts: number;
  elapsedTime: number;
  phase: 'idle' | 'playing' | 'finished';
  playerName: string;
  gameMode: GameMode;
  isBlinking: boolean;
  highlightedState: string | null;
  startTime: number | null;
  isGuest: boolean;
  totalWrongAttempts: number;
  
  startGame: (name: string, mode: GameMode, isGuest?: boolean) => void;
  answerState: (id: string) => 'correct' | 'wrong' | 'ignored';
  nextQuestion: () => void;
  updateTime: () => void;
  setBlinking: (blinking: boolean, stateId: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  states: [],
  currentIndex: 0,
  wrongAttempts: 0,
  elapsedTime: 0,
  phase: 'idle',
  playerName: '',
  gameMode: 'states',
  isBlinking: false,
  highlightedState: null,
  startTime: null,
  isGuest: false,
  totalWrongAttempts: 0,

  startGame: (name: string, mode: GameMode, isGuest: boolean = false) => {
    let filteredStates = statesData;
    if (mode === 'states') {
      filteredStates = statesData.filter(s => s.type === 'state');
    } else if (mode === 'uts') {
      filteredStates = statesData.filter(s => s.type === 'ut');
    } else if (mode === 'capitals') {
      // For capitals, we'll use all states and UTs, but the prompt will ask for capitals
      filteredStates = statesData; 
    }

    set({
      states: shuffleArray(filteredStates),
      currentIndex: 0,
      wrongAttempts: 0,
      elapsedTime: 0,
      phase: 'playing',
      playerName: name,
      gameMode: mode,
      isBlinking: false,
      highlightedState: null,
      startTime: null,
      isGuest,
      totalWrongAttempts: 0,
    });
  },

  answerState: (clickedName: string) => {
    const { states, currentIndex, wrongAttempts, isBlinking, startTime } = get();
    if (isBlinking || currentIndex >= states.length) return 'ignored';

    if (!startTime) {
      set({ startTime: Date.now() });
    }

    const targetState = states[currentIndex];
    // Map answer check: we still click on the state based on its "name".
    if (clickedName === targetState.name) {
       return 'correct';
    } else {
       const newAttempts = wrongAttempts + 1;
       set((state) => ({ 
         wrongAttempts: newAttempts,
         totalWrongAttempts: state.totalWrongAttempts + 1
       }));
       return 'wrong';
    }
  },

  nextQuestion: () => {
    const { states, currentIndex, playerName, elapsedTime, isGuest } = get();
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= states.length) {
      // Game over
      if (!isGuest) {
        saveResult(playerName, elapsedTime);
      }
      set({ phase: 'finished', isBlinking: false, highlightedState: null });
    } else {
      set({ 
        currentIndex: nextIndex, 
        wrongAttempts: 0,
        isBlinking: false,
        highlightedState: null
      });
    }
  },

  updateTime: () => {
    const { phase, startTime } = get();
    // Only update if playing
    if (phase === 'playing' && startTime) {
      set({ elapsedTime: Math.floor((Date.now() - startTime) / 1000) });
    }
  },

  setBlinking: (blinking: boolean, stateId: string) => {
    set({ isBlinking: blinking, highlightedState: stateId });
  }
}));
