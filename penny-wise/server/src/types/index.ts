import mongoose, { Document } from "mongoose";

export enum ExpenseCategory {
  FOOD = "food",
  TRANSPORT = "transport",
  UTILITIES = "utilities",
  ENTERTAINMENT = "entertainment",
  HEALTHCARE = "healthcare",
  SHOPPING = "shopping",
  EDUCATION = "education",
  OTHER = "other",
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  token?: string;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTotals {
  month: string;
  total: number;
  count: number;
}

export interface DashboardStats {
  totalExpenses: number;
  expenseCount: number;
  roundedAverageExpenseAmount: number;
  highestExpense: IExpense;
  lowestExpense: IExpense;
  currentMonthTotal: number;
  lastMonthTotal: number;
  monthlyChange: number;
}

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
