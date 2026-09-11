import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PuzzlePhase, PuzzleTheme } from '../lib/puzzles/generate';

export type PuzzlesState = {
  targetRating: number;
  phase: PuzzlePhase;
  theme: PuzzleTheme | 'any';
  solved: number;
  attempted: number;
  streak: number;
  bestStreak: number;
  /** Positions already served, so a puzzle is never repeated. */
  seen: string[];
  /** Countdown per puzzle, by id from PUZZLE_LIMITS. */
  timeLimitId: string;
};

/** Bounded so the stored history cannot grow without limit. */
const MAX_SEEN = 300;

export const defaultPuzzlesState: PuzzlesState = {
  targetRating: 1200,
  phase: 'any',
  theme: 'any',
  solved: 0,
  attempted: 0,
  streak: 0,
  bestStreak: 0,
  seen: [],
  timeLimitId: 'none',
};

const puzzlesSlice = createSlice({
  name: 'puzzles',
  initialState: defaultPuzzlesState,
  reducers: {
    setTargetRating(state, action: PayloadAction<number>) {
      state.targetRating = Math.max(600, Math.min(2600, Math.round(action.payload / 50) * 50));
    },
    setPhase(state, action: PayloadAction<PuzzlePhase>) {
      state.phase = action.payload;
    },
    setTheme(state, action: PayloadAction<PuzzleTheme | 'any'>) {
      state.theme = action.payload;
    },
    setTimeLimitId(state, action: PayloadAction<string>) {
      state.timeLimitId = action.payload;
    },
    puzzleServed(state, action: PayloadAction<string>) {
      state.seen.unshift(action.payload);
      if (state.seen.length > MAX_SEEN) state.seen.length = MAX_SEEN;
    },
    puzzleSolved(state) {
      state.solved += 1;
      state.attempted += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    },
    puzzleFailed(state) {
      state.attempted += 1;
      state.streak = 0;
    },
    resetStats(state) {
      state.solved = 0;
      state.attempted = 0;
      state.streak = 0;
      state.bestStreak = 0;
    },
  },
});

export const {
  setTargetRating,
  setPhase,
  setTheme,
  setTimeLimitId,
  puzzleServed,
  puzzleSolved,
  puzzleFailed,
  resetStats,
} = puzzlesSlice.actions;

export default puzzlesSlice.reducer;
