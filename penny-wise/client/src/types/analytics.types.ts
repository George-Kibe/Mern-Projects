import { Expense } from ".";

export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
  count: number;
}

export interface DashboardStats {
  totalExpenses: number;
  expenseCount: number;
  roundedAverageExpenseAmount: number;

  highestExpense: Expense | null;
  lowestExpense: Expense | null;
  lastMonthTotal: number;

  currentMonthTotal: number;
  monthlyChange: number;
}

export interface SpendingTrend {
  month: string;
  total: number;
  count: number;
}

export interface AnalyticsState {
  categoryData: CategoryTotal[];

  dashboardStats: DashboardStats | null;
  trends: SpendingTrend[];
  periodData: CategoryTotal[];

  currentMonthData: CategoryTotal[];
  yearlyCategoryData: { [year: string]: YearlyCategoryStats[] };
  allYearsData: AllYears[];
  availableYears: number[];
  selectedYear: number | null;

  yearlyData: { [year: string]: MonthlyTotal[] };

  isLoading: boolean;
  error: string | null;
}

export interface YearlyCategoryStats {
  month: number;
  total: number;
  categories: {
    category: string;
    total: number;
    count: number;
  }[];
}

export interface AllYears {
  year: number;
  total: number;
  count: number;
}
