import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type GameSource = 'engine' | 'friend' | 'import';

export type SavedGame = {
  id: string;
  pgn: string;
  /** Free-text label shown in the library, e.g. "vs Club (level 2)". */
  label: string;
  source: GameSource;
  result: string;
  savedAt: number;
};

export type GamesState = {
  games: SavedGame[];
};

const MAX_GAMES = 50;

export const defaultGamesState: GamesState = { games: [] };

const gamesSlice = createSlice({
  name: 'games',
  initialState: defaultGamesState,
  reducers: {
    saveGame: {
      reducer(state, action: PayloadAction<SavedGame>) {
        state.games.unshift(action.payload);
        // Keep the library bounded — this lives in localStorage.
        if (state.games.length > MAX_GAMES) state.games.length = MAX_GAMES;
      },
      prepare(input: Omit<SavedGame, 'id' | 'savedAt'>) {
        return { payload: { ...input, id: nanoid(), savedAt: Date.now() } };
      },
    },
    removeGame(state, action: PayloadAction<string>) {
      state.games = state.games.filter((g) => g.id !== action.payload);
    },
    clearGames(state) {
      state.games = [];
    },
  },
});

export const { saveGame, removeGame, clearGames } = gamesSlice.actions;
export default gamesSlice.reducer;
