import { Expense } from ".";

export interface ExpenseFormData {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface ExpenseFilters {
  category?: string;
  sort?: string;

  searchTerm?: string;
  startDate?: string | null;
  endDate?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
}

export interface ExpenseState {
  expenses: Expense[];
  currentExpense: Expense | null;
  isLoading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  totalCount: number;

  page: number;
  itemsPerPage: number;
}
