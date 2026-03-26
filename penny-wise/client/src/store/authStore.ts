import { create } from "zustand";
import { TOKEN_KEY } from "@/services/api";
import { AuthState } from "@/types/auth.types";
import {
  signup as signupService,
  login as loginService,
  getProfile as getProfileService,
  updateProfile as updateProfileService,
  uploadAvatar as uploadAvatarService,
  deleteAvatar as deleteAvatarService,
  deleteAccount as deleteAccountService,
  exportData as exportDataService,
} from "@/services/authService";
import { AxiosError } from "axios";

interface AuthStore extends AuthState {
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => Promise<void>;

  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  exportData: () => Promise<void>;
  deleteAccount: () => Promise<void>;

  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  exportedData: null,

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await signupService({ name, email, password });

      if (response.data) {
        const { user } = response.data;

        set({
          user,

          isLoading: false,
        });

        return true;
      }

      return false;
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });

      return false;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await loginService({ email, password });

      if (response.data) {
        const { user, token } = response.data;

        localStorage.setItem(TOKEN_KEY, token);

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  getProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getProfileService();

      if (response.data) {
        set({
          user: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await updateProfileService(data);

      if (response.data) {
        set({
          user: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  uploadAvatar: async (file: File) => {
    set({ isLoading: true, error: null });

    try {
      const response = await uploadAvatarService(file);

      if (response.data) {
        const { avatar } = response.data;

        set((state) => ({
          user: state.user ? { ...state.user, avatar } : null,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  deleteAvatar: async () => {
    set({ isLoading: true, error: null });

    try {
      await deleteAvatarService();

      set((state) => ({
        user: state.user ? { ...state.user, avatar: undefined } : null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  exportData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await exportDataService();

      if (response.data) {
        set({
          exportedData: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });

    try {
      await deleteAccountService();

      localStorage.removeItem(TOKEN_KEY);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
