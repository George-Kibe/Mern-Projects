import CategoryPieChart from "@/components/Dashboard/CategoryPieChart";
import DateRangeSelector from "@/components/Dashboard/DateRangeSelector";
import RecentExpenseItem from "@/components/Dashboard/RecentExpenseItem";
import StatsCard from "@/components/Dashboard/StatsCard";
import TrendLineChart from "@/components/Dashboard/TrendLineChart";
import ExpenseModal from "@/components/Expenses/ExpenseModal";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useAuthStore } from "@/store/authStore";
import { useExpenseStore } from "@/store/expenseStore";
import { Expense } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const {
    dashboardStats,
    categoryData,
    periodData,
    trends,
    isLoading: analyticsLoading,
    getCategoryStats,
    getDashboardStats,
    getTrends,
    getPeriodStats,
  } = useAnalyticsStore();

  const { user } = useAuthStore();

  const {
    expenses,
    isLoading: expensesLoading,
    setDateRange,
    getAllExpenses,
  } = useExpenseStore();

  useEffect(() => {
    getAllExpenses();
  }, [getAllExpenses]);

  useEffect(() => {
    if (expenses.length > 0) {
      getDashboardStats();
      getCategoryStats();
      getTrends();
    }
  }, [getDashboardStats, getCategoryStats, getTrends, expenses.length]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined,
  );
  const [selectedRange, setSelectedRange] = useState("180");

  // ─────────────────────────────────────────────────────────────────
  // WHY I ADDED expenses.length TO THE DEPENDENCY ARRAY
  // ─────────────────────────────────────────────────────────────────
  // Before this fix, this useEffect only re-ran when selectedRange
  // changed (e.g. user picks "Last 30 Days" from the dropdown).
  //
  // The problem: when a brand new expense is created on the dashboard,
  // expenses.length changes from 0 to 1, but selectedRange did NOT
  // change — so this useEffect never ran, and getPeriodStats was
  // never called, leaving the pie chart empty.
  //
  // The fix: by adding expenses.length to the dependency array, React
  // will now also re-run this useEffect whenever the number of expenses
  // changes — which includes the moment the first expense is created.
  //
  // The guard "expenses.length > 0" makes sure we don't make a wasted
  // API call when there are no expenses to analyse.
  // ─────────────────────────────────────────────────────────────────
  // ✅ Added expenses.length to deps so it re-runs when a new expense is created
  // ✅ Added expenses.length > 0 guard to avoid calling with no data
  useEffect(() => {
    if (selectedRange !== "all" && expenses.length > 0) {
      const days = parseFloat(selectedRange);
      getPeriodStats(days);
    }
  }, [selectedRange, getPeriodStats, expenses.length]);

  const navigate = useNavigate();

  function handleAddExpense() {
    setIsModalOpen(true);
    setEditingExpense(undefined);
  }

  function handleCloseModal() {
    setEditingExpense(undefined);
    setIsModalOpen(false);
  }

  function handleExpenseClick(expense: Expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  function handleMonthClick() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${lastDay.toString().padStart(2, "0")}`;

    setDateRange(startDate, endDate);
    navigate({ to: "/expenses" });
  }

  function handleDateRangeChange(range: string) {
    setSelectedRange(range);

    if (range === "all") {
      getCategoryStats();
    } else {
      const days = parseFloat(range);
      getPeriodStats(days);
    }
  }

  const isLoading = analyticsLoading || expensesLoading;

  const chartData = selectedRange === "all" ? categoryData : periodData;

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  if (!isLoading && expenses.length === 0) {
    return (
      <main className="bg-slate-950 p-4 sm:px-8 sm:py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <Package className="size-24 text-gray-700" strokeWidth={1} />

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              No expenses yet
            </h2>
            <p className="text-gray-400">
              Start tracking your spending by adding your first expense
            </p>
          </div>
          <button
            onClick={handleAddExpense}
            className="flex items-center gap-2 px-6 py-3 bg-purple-950 text-gray-100 rounded-sm hover:bg-purple-800 transition font-medium"
          >
            <Plus className="size-5" />
            Add Your First Expense
          </button>
        </div>

        <ExpenseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          expense={editingExpense}
        />
      </main>
    );
  }

  if (!isLoading && !dashboardStats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-400 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="bg-slate-950 px-4 py-8 sm:px-8 sm:py-12">
      <div className="border-b border-purple-950 pb-4 mb-8 flex flex-col gap-8 justify-start sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400 mt-1">Here's your financial overview</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-950 text-gray-100 rounded-sm hover:bg-purple-800 transition font-medium"
        >
          <Plus className="size-5" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardStats && (
          <>
            <StatsCard
              icon={DollarSign}
              label="Total Expenses"
              // value={`$${dashboardStats.totalExpenses.toFixed(2)}`}
              value={`$${(dashboardStats.totalExpenses ?? 0).toFixed(2)}`}
            />

            <StatsCard
              icon={Package}
              label="Number of Expenses"
              // value={dashboardStats.expenseCount}
              value={dashboardStats.expenseCount ?? 0}
            />

            <StatsCard
              icon={TrendingUp}
              label="Average Expense"
              // value={`$${dashboardStats.roundedAverageExpenseAmount.toFixed(2)}`}
              value={`$${(dashboardStats.roundedAverageExpenseAmount ?? 0).toFixed(2)}`}
            />

            <StatsCard
              icon={Calendar}
              label="This Month"
              // value={`$${dashboardStats.currentMonthTotal.toFixed(2)}`}
              value={`$${(dashboardStats.currentMonthTotal ?? 0).toFixed(2)}`}
              onClick={handleMonthClick}
            />
          </>
        )}
      </div>

      <div>
        <DateRangeSelector
          selected={selectedRange}
          onChange={handleDateRangeChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.length > 0 && (
          <CategoryPieChart data={chartData} selectedPeriod={selectedRange} />
        )}

        {trends.length > 0 && <TrendLineChart data={trends} />}
      </div>

      <div className="flex flex-col gap-4 p-6 mt-8 border border-purple-950 rounded-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">
            Recent Expenses
          </h3>

          <button
            onClick={() => navigate({ to: "/expenses" })}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium flex gap-2"
          >
            View All <ArrowRight className="size-5" />
          </button>
        </div>

        {recentExpenses.map((expense) => (
          <RecentExpenseItem
            key={expense._id}
            expense={expense}
            onClick={handleExpenseClick}
          />
        ))}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
      />
    </main>
  );
}
