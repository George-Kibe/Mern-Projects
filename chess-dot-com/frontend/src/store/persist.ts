import type { Middleware } from '@reduxjs/toolkit';
import { defaultEngineState, type EngineState } from './engineSlice';
import { defaultGamesState, type GamesState } from './gamesSlice';
import { defaultPuzzlesState, type PuzzlesState } from './puzzlesSlice';
import { DEFAULT_HOST_VOICE } from '../lib/speech/serverSpeech';

const STORAGE_KEY = 'chess-trainer:v1';

/**
 * Shape written to storage. Declared from the slices rather than from
 * `RootState`, because the store's type is itself derived from what this
 * function returns.
 */
export type PersistedState = {
  engine?: EngineState;
  games?: GamesState;
  puzzles?: PuzzlesState;
};

/**
 * Stand-in for a database. Everything lives in localStorage, so a refresh keeps
 * your games and settings but nothing leaves the browser.
 *
 * Reads are defensive: stored state is user-editable and survives across code
 * changes, so a bad or stale payload must never stop the app booting.
 */
export function loadPersistedState(): PersistedState | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return undefined;

    const candidate = parsed as Partial<PersistedState>;
    const state: PersistedState = {};

    // Merge onto the current defaults rather than replacing them. State written
    // by an older build is missing any field added since, and reading through a
    // missing nested object throws during render — which blanks the whole app.
    if (candidate.engine && typeof candidate.engine === 'object') {
      state.engine = {
        ...defaultEngineState,
        ...candidate.engine,
        hostVoice: { ...DEFAULT_HOST_VOICE, ...(candidate.engine.hostVoice ?? {}) },
      };
    }
    if (candidate.games && Array.isArray(candidate.games.games)) {
      state.games = { ...defaultGamesState, ...candidate.games };
    }
    if (candidate.puzzles && typeof candidate.puzzles === 'object') {
      state.puzzles = {
        ...defaultPuzzlesState,
        ...candidate.puzzles,
        seen: Array.isArray(candidate.puzzles.seen) ? candidate.puzzles.seen : [],
      };
    }

    return state;
  } catch {
    return undefined;
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;

export const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Coalesce bursts of actions into one write.
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      const { engine, games, puzzles } = store.getState() as PersistedState;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ engine, games, puzzles }));
    } catch {
      // Quota exceeded or storage disabled — losing persistence is survivable.
    }
  }, 250);

  return result;
};
