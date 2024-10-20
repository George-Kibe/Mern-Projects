import { configureStore } from '@reduxjs/toolkit';
import { blogsApi } from './features/blogs/blogsApi';
import authApi from './features/auth/authApi';
import authReducer from './features/auth/authSlice';
import commentApi from './features/comments/commentsApi';

export const store = configureStore({
  reducer: {
    [blogsApi.reducerPath]: blogsApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(blogsApi.middleware, commentApi.middleware, authApi.middleware),
});
