import { useAnalyticsStore } from "@/store/analyticsStore";
import { useEffect, useMemo } from "react";
import YearlyOverviewChart from "./YearlyOverviewChart";
import YearCategoryChart from "./YearCategoryChart";

interface DynamicYearSectionProps {
  year: number;
}

export default function DynamicYearSection({ year }: DynamicYearSectionProps) {
  const {
    yearlyData,
    yearlyCategoryData,
    getYearlyStats,
    getYearlyCategoryStats,
  } = useAnalyticsStore();

  useEffect(() => {
    if (!yearlyData[year]) {
      getYearlyStats(year);
    }

    if (!yearlyCategoryData[year]) {
      getYearlyCategoryStats(year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const yearCategoryTotals = useMemo(() => {
    if (!yearlyCategoryData[year]) return [];

    const totals: { [key: string]: { total: number; count: number } } = {};

    yearlyCategoryData[year].forEach((month) => {
      month.categories.forEach((cat) => {
        if (!totals[cat.category]) {
          totals[cat.category] = { total: 0, count: 0 };
        }

        totals[cat.category].total += cat.total;
        totals[cat.category].count += cat.count;
      });
    });

    const grandTotal = Object.values(totals).reduce(
      (sum, t) => sum + t.total,
      0,
    );

    return Object.entries(totals).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: (data.total / grandTotal) * 100,
    }));
  }, [yearlyCategoryData, year]);

  return (
    <div className="space-y-6">
      <div className="border-b border-purple-950 pb-4">
        <h2 className="text-2xl font-bold text-gray-100">{year} Analytics</h2>
        <p className="text-gray-400 mt-1">Detailed breakdown for {year}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {yearCategoryTotals.length > 0 && (
          <YearCategoryChart data={yearCategoryTotals} year={year} />
        )}

        {yearlyData[year] && yearlyData[year].length > 0 && (
          <YearlyOverviewChart data={yearlyData[year]} year={year} />
        )}
      </div>
    </div>
  );
}
