import { User } from ".";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  exportedData: ExportData | null;
}

export interface Avatar {
  avatar: string;
  avatarUrl: string;
}

export interface ExportData {
  user: User;
  expenses: Array<{
    _id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
  }>;
  summary: {
    totalExpenses: number;
    expenseCount: number;
  };
  exportedAt: string;
}
