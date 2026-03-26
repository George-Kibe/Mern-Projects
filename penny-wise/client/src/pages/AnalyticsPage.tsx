import AllYearsChart from "@/components/Analytics/AllYearsChart";
import CategoryTable from "@/components/Analytics/CategoryTable";
import CurrentMonthBarChart from "@/components/Analytics/CurrentMonthBarChart";
import InsightsCard from "@/components/Analytics/InsightsCard";
import LazyLoadSection from "@/components/Analytics/LazyLoadSection";
import SummaryCard from "@/components/Analytics/SummaryCard";
import YearSelector from "@/components/Analytics/YearSelector";
import YearlyCategoryChart from "@/components/Analytics/YearlyCategoryChart";
import YearlyOverviewChart from "@/components/Analytics/YearlyOverviewChart";
import CategoryPieChart from "@/components/Dashboard/CategoryPieChart";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useExpenseStore } from "@/store/expenseStore";
import {
  BarChart,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

export default function AnalyticsPage() {
  const {
    isLoading,
    dashboardStats,
    yearlyData,
    trends,
    selectedYear,
    yearlyCategoryData,
    categoryData,
    availableYears,
    currentMonthData,
    allYearsData,
    getYearlyStats,
    getYearlyCategoryStats,
    loadAllAnalytics,
    setSelectedYear,
  } = useAnalyticsStore();
  const { expenses } = useExpenseStore();

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadAllAnalytics();
    }
  }, [loadAllAnalytics]);

  useEffect(() => {
    if (selectedYear) {
      if (!yearlyData[selectedYear]) {
        getYearlyStats(selectedYear);
      }

      if (!yearlyCategoryData[selectedYear]) {
        getYearlyCategoryStats(selectedYear);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedYear,
    // yearlyData,
    // yearlyCategoryData,
    // getYearlyStats,
    // getYearlyCategoryStats,
  ]);

  function handleYearChange(year: number) {
    setSelectedYear(year);
  }

  const highestMonth = useMemo(() => {
    const allMonths = Object.values(yearlyData).flat();

    if (allMonths.length === 0) return null;

    const highest = allMonths.reduce((max, current) => {
      return current.total > max.total ? current : max;
    });

    const [month, year] = highest.month.split("-");
    const date = new Date(`${year}-${month}-01`);
    const monthName = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return {
      amount: highest.total,
      month: monthName,
    };
  }, [yearlyData]);

  const lowestMonth = useMemo(() => {
    const allMonths = Object.values(yearlyData).flat();

    if (allMonths.length === 0) return null;

    const lowest = allMonths.reduce((min, current) => {
      return current.total < min.total ? current : min;
    });

    const [month, year] = lowest.month.split("-");
    const date = new Date(`${year}-${month}-01`);
    const monthName = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return {
      amount: lowest.total,
      month: monthName,
    };
  }, [yearlyData]);

  const monthlyAverage = useMemo(() => {
    if (!trends || trends.length === 0) return null;

    const sum = trends.reduce((acc, month) => acc + month.total, 0);
    return sum / trends.length;
  }, [trends]);

  if (isLoading && !dashboardStats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <p className="text-gray-400 text-lg">Loading analytics...</p>
      </div>
    );
  }

  if (!isLoading && expenses.length === 0) {
    return (
      <main className="bg-slate-950 p-4 sm:px-8 sm:py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          {/* ✅ Empty state icon */}
          <Package className="size-24 text-gray-700" strokeWidth={1} />

          {/* ✅ Empty state text */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              No expenses yet
            </h2>
            <p className="text-gray-400">
              Start tracking your spending by adding your first expense
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (selectedYear === null) return null;

  return (
    <main className="bg-slate-950  px-4 py-8 sm:px-8 sm:py-12">
      <div className="border-b border-purple-950 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-100">
          Analytics Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Detailed insights into your spending patterns and trends
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardStats && (
          <SummaryCard
            icon={DollarSign}
            label="Total Analyzed"
            // value={`$${dashboardStats.totalExpenses.toFixed(2)}`}
            value={`$${(dashboardStats.totalExpenses ?? 0).toFixed(2)}`}
            subtext="All Time"
          />
        )}

        {highestMonth && (
          <SummaryCard
            icon={TrendingUp}
            label="Highest Month"
            value={`$${highestMonth.amount.toFixed(2)}`}
            subtext={highestMonth.month}
          />
        )}

        {lowestMonth && (
          <SummaryCard
            icon={TrendingDown}
            label="Lowest Month"
            value={`$${lowestMonth.amount.toFixed(2)}`}
            subtext={lowestMonth.month}
          />
        )}

        {monthlyAverage && (
          <SummaryCard
            icon={BarChart}
            label="Monthly Average"
            value={`$${monthlyAverage.toFixed(2)}`}
            subtext="Last Six Months"
          />
        )}
      </div>

      <InsightsCard
        dashboardStats={dashboardStats}
        categoryData={categoryData}
        trends={trends}
        availableYears={availableYears}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.length > 0 && (
          <CategoryPieChart data={categoryData} selectedPeriod="all" />
        )}

        {currentMonthData.length > 0 && (
          <CurrentMonthBarChart data={currentMonthData} />
        )}
      </div>

      {categoryData.length > 0 && (
        <div className="mt-6">
          <CategoryTable data={categoryData} />
        </div>
      )}

      <div className="space-y-6 mt-6">
        {availableYears.length > 0 && (
          <div className="flex justify-start">
            <YearSelector
              selectedYear={selectedYear}
              availableYears={availableYears}
              onChange={handleYearChange}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {yearlyData[selectedYear] && yearlyData[selectedYear].length > 0 && (
            <YearlyOverviewChart
              data={yearlyData[selectedYear]}
              year={selectedYear}
            />
          )}

          {yearlyCategoryData[selectedYear] &&
            yearlyCategoryData[selectedYear].length > 0 && (
              <YearlyCategoryChart
                data={yearlyCategoryData[selectedYear]}
                year={selectedYear}
              />
            )}
        </div>
      </div>

      {allYearsData.length > 0 && (
        <div className="my-8">
          <AllYearsChart data={allYearsData} />
        </div>
      )}

      {/* <div className="space-y-12">
        {availableYears.map((year) => (
          <DynamicYearSection key={year} year={year} />
        ))}
      </div> */}

      <div className="space-y-12">
        {availableYears.map((year) => (
          <LazyLoadSection key={year} year={year} />
        ))}
      </div>
    </main>
  );
}
