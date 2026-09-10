import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import engineReducer from './engineSlice';
import gamesReducer from './gamesSlice';
import { loadPersistedState, persistMiddleware } from './persist';

// Combined up front so RootState derives from the reducers rather than from the
// store — otherwise the persisted preloadedState makes the type circular.
const rootReducer = combineReducers({
  engine: engineReducer,
  games: gamesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPersistedState(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistMiddleware),
});

export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];

// Pre-typed hooks: use these instead of the plain react-redux ones.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
