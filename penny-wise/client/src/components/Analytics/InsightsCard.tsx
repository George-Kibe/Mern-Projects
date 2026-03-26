import {
  CategoryTotal,
  DashboardStats,
  SpendingTrend,
} from "@/types/analytics.types";
import {
  Calendar,
  DollarSign,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface InsightsCardProps {
  dashboardStats: DashboardStats | null;
  categoryData: CategoryTotal[];
  trends: SpendingTrend[];
  availableYears: number[];
}

interface Insight {
  text: string;
  type: "positive" | "negative" | "neutral";
  icon:
    | typeof TrendingUp
    | typeof TrendingDown
    | typeof DollarSign
    | typeof Calendar
    | typeof Target;
}

export default function InsightsCard({
  dashboardStats,
  categoryData,
  trends,
  availableYears,
}: InsightsCardProps) {
  function generateInsights(): Insight[] {
    const insights: Insight[] = [];

    if (dashboardStats && dashboardStats.monthlyChange !== 0) {
      const changePercent = Math.abs(dashboardStats.monthlyChange);
      const isIncrease = dashboardStats.monthlyChange > 0;

      insights.push({
        text: isIncrease
          ? `You spent ${changePercent.toFixed(
              1,
            )}% more this month compared to last month`
          : `You spent ${changePercent.toFixed(
              1,
            )}% less this month compared to last month`,
        type: isIncrease ? "negative" : "positive",
        icon: isIncrease ? TrendingUp : TrendingDown,
      });
    }

    if (categoryData.length > 0) {
      const highestCategory = categoryData.reduce((max, current) => {
        return current.total > max.total ? current : max;
      });

      insights.push({
        text: `${
          highestCategory.category.charAt(0).toUpperCase() +
          highestCategory.category.slice(1)
        } was your biggest expense category ($${highestCategory.total.toFixed(
          2,
        )})`,
        type: "neutral",
        icon: Target,
      });
    }

    if (dashboardStats && dashboardStats.roundedAverageExpenseAmount > 0) {
      insights.push({
        text: `Your average expense amount is $${dashboardStats.roundedAverageExpenseAmount.toFixed(
          2,
        )}`,
        type: "neutral",
        icon: DollarSign,
      });
    }

    if (trends.length > 0) {
      const highestMonth = trends.reduce((max, current) => {
        return current.total > max.total ? current : max;
      });

      const [month, year] = highestMonth.month.split("-");
      const date = new Date(`${year}-${month}-01`);
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      insights.push({
        text: `You spent the most in ${monthName} over last six months ($${highestMonth.total.toFixed(
          2,
        )})`,
        type: "neutral",
        icon: Calendar,
      });
    }

    if (availableYears.length > 1) {
      insights.push({
        text: `You've tracked expenses across ${availableYears.length} different years`,
        type: "positive",
        icon: TrendingUp,
      });
    }

    if (dashboardStats && dashboardStats.expenseCount > 0) {
      insights.push({
        text: `You've tracked ${
          dashboardStats.expenseCount
        } expenses totaling $${dashboardStats.totalExpenses.toFixed(2)}`,
        type: "neutral",
        icon: Target,
      });
    }

    return insights;
  }

  const insights = generateInsights();

  function getColorClasses(type: "positive" | "negative" | "neutral"): string {
    switch (type) {
      case "positive":
        return "text-green-400 bg-green-900/20";
      case "negative":
        return "text-red-400 bg-red-900/20";
      case "neutral":
        return "text-blue-400 bg-blue-900/20";
    }
  }

  return (
    <div className="border border-purple-950 rounded-sm p-6 my-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-100">
          Spending Insights
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Auto-generated insights from your data
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const colorClasses = getColorClasses(insight.type);

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-sm"
            >
              <p className={`p-2 rounded-sm ${colorClasses}`}>
                <Icon className="size-4" />
              </p>
              <p className="text-sm text-gray-300 leading-relaxed flex-1">
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Add more expenses to generate insights
        </p>
      )}
    </div>
  );
}
