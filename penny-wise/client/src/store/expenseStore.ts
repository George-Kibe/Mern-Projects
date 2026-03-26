import { ExpenseState } from "@/types/expense.types";
import { create } from "zustand";
import {
  createExpense as createExpenseService,
  getAllExpenses as getAllExpensesService,
  updateExpense as updateExpenseService,
  deleteExpense as deleteExpenseService,
} from "@/services/expenseService";
import { AxiosError } from "axios";

interface ExpenseStore extends ExpenseState {
  clearError: () => void;

  createExpense: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => Promise<void>;
  getAllExpenses: () => Promise<void>;
  updateExpense: (
    id: string,
    data: {
      amount: number;
      description: string;
      category: string;
      date: string;
    },
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  setCategory: (category: string) => void;
  setSort: (sort: string) => void;
  clearFilters: () => void;

  setSearchTerm: (term: string) => void;
  setDateRange: (start: string | null, end: string | null) => void;
  setAmountRange: (min: number | null, max: number | null) => void;
  removeFilter: (filterType: string) => void;

  loadMoreExpenses: () => void;
  resetPagination: () => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentExpense: null,
  filters: {
    category: "all",
    sort: "-date",
    searchTerm: "",
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
  },

  page: 1,
  itemsPerPage: 20,

  clearError: () => set({ error: null }),

  setCategory: (category: string) => {
    set({ filters: { ...get().filters, category } });
    get().getAllExpenses();
    get().resetPagination();
  },

  setSort: (sort: string) => {
    set({ filters: { ...get().filters, sort } });
    get().getAllExpenses();
    get().resetPagination();
  },

  clearFilters: () => {
    set({
      filters: {
        category: "all",
        sort: "-date",
        searchTerm: "",
        startDate: null,
        endDate: null,
        minAmount: null,
        maxAmount: null,
      },
    });
    get().getAllExpenses();
    get().resetPagination();
  },

  setSearchTerm: (term: string) => {
    set((state) => ({ filters: { ...state.filters, searchTerm: term } }));
    get().resetPagination();
  },

  setDateRange: (start: string | null, end: string | null) => {
    set((state) => ({
      filters: { ...state.filters, startDate: start, endDate: end },
    }));
    get().resetPagination();
  },

  setAmountRange: (min: number | null, max: number | null) => {
    set((state) => ({
      filters: { ...state.filters, minAmount: min, maxAmount: max },
    }));
    get().resetPagination();
  },

  removeFilter: (filterType: string) => {
    switch (filterType) {
      case "category":
        set((state) => ({ filters: { ...state.filters, category: "all" } }));
        break;
      case "sort":
        set((state) => ({ filters: { ...state.filters, sort: "-date" } }));
        break;
      case "search":
        set((state) => ({ filters: { ...state.filters, searchTerm: "" } }));
        break;
      case "dateRange":
        set((state) => ({
          filters: { ...state.filters, startDate: null, endDate: null },
        }));
        break;
      case "amountRange":
        set((state) => ({
          filters: { ...state.filters, minAmount: null, maxAmount: null },
        }));
        break;
    }
    get().getAllExpenses();
    get().resetPagination();
  },

  loadMoreExpenses: () => {
    const { page } = get();
    set({ page: page + 1 });
  },

  resetPagination: () => {
    set({ page: 1 });
  },

  createExpense: async (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await createExpenseService(data);
      if (response.data) {
        set((state) => ({
          expenses: [...state.expenses, response.data!],
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  getAllExpenses: async () => {
    set({ isLoading: true, error: null });

    try {
      const { filters } = get();

      const queryParams = new URLSearchParams();

      if (filters.category && filters.category !== "all") {
        queryParams.append("category", filters.category);
      }

      if (filters.sort) {
        queryParams.append("sort", filters.sort);
      }

      const queryString = queryParams.toString();
      const endPoint = queryString ? `/expenses?${queryString}` : "/expenses";

      const response = await getAllExpensesService(endPoint);

      if (response.data) {
        set({
          expenses: response.data,
          totalCount: response.data.length,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  updateExpense: async (
    id: string,
    data: {
      amount: number;
      description: string;
      category: string;
      date: string;
    },
  ) => {
    set({ isLoading: true, error: null });

    try {
      const response = await updateExpenseService(id, data);

      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense._id === id ? response.data! : expense,
        ),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  deleteExpense: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await deleteExpenseService(id);

      set((state) => ({
        expenses: state.expenses.filter((expense) => expense._id !== id),
        totalCount: state.totalCount - 1,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },
}));
