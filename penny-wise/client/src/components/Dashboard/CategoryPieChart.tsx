import { useExpenseStore } from "@/store/expenseStore";
import { CategoryTotal } from "@/types/analytics.types";
import { getCategoryConfig } from "@/utils/CategoryConfig";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Cell,
  Pie,
  ResponsiveContainer,
  PieChart,
  Tooltip,
  Legend,
} from "recharts";

interface CategoryPieChartProps {
  data: CategoryTotal[];
  selectedPeriod: string;
}

interface CustomToolTipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      category: string;
      total: number;
      percentage: number;
      count: number;
    };
  }>;
}

const CustomToolTip = ({ active, payload }: CustomToolTipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-slate-800 border border-purple-700 rounded-sm p-3">
        <p className="text-gray-100 font-medium">
          {getCategoryConfig(data.category).emoji}{" "}
          {getCategoryConfig(data.category).label}
        </p>
        <p className="text-purple-400 font-bold">${data.total.toFixed(2)}</p>
        <p className="text-gray-400 text-sm">
          {data.percentage.toFixed(1)}% of total
        </p>
        <p className="text-gray-400 text-sm">
          {data.count} expense{data.count === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  return null;
};

interface LegendPayload {
  color: string;
  payload: {
    category: string;
    total: number;
    percentage: number;
    count: number;
  };
}

interface CustomLegendProps {
  payload?: LegendPayload[];
}

const CustomLegend = ({ payload }: CustomLegendProps) => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {payload?.map((entry, index: number) => {
        const categoryData = entry.payload;
        const config = getCategoryConfig(categoryData.category);

        return (
          <div
            key={`legend-${index}`}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">
                {config.emoji} {config.label}
              </span>
            </div>

            <span className="text-gray-400">
              ${categoryData.total.toFixed(2)} (
              {categoryData.percentage.toFixed(1)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function CategoryPieChart({
  data,
  selectedPeriod,
}: CategoryPieChartProps) {
  const { setCategory, setDateRange } = useExpenseStore();
  const navigate = useNavigate();

  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowLabels(window.innerWidth >= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleSliceClick(entry: CategoryTotal) {
    setCategory(entry.category);

    if (selectedPeriod !== "all") {
      const days = parseFloat(selectedPeriod);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      // console.log("PIE-Start", start);
      // console.log("PIE-End", end);

      setDateRange(start, end);
    }

    navigate({ to: "/expenses" });
  }

  const chartData = data.map((item) => ({
    category: item.category,
    total: item.total,
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="flex flex-col gap-4 p-6 border border-purple-950 rounded-sm">
      <h3 className="text-lg font-semibold text-gray-100">
        Spending by Category
      </h3>

      <ResponsiveContainer width="100%" height={550}>
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            dataKey="total"
            nameKey="category"
            data={chartData}
            outerRadius={120}
            label={
              showLabels
                ? (entry) => `${(entry.percent! * 100).toFixed(1)}%`
                : false
            }
            onClick={handleSliceClick}
            className="cursor-pointer"
          >
            {data.map((entry, index) => {
              const config = getCategoryConfig(entry.category);

              const getColorFromClassName = (className: string) => {
                if (className.includes("green")) return "#4ade80";
                if (className.includes("blue")) return "#60a5fa";
                if (className.includes("red")) return "#f87171";
                if (className.includes("yellow")) return "#fbbf24";
                if (className.includes("purple")) return "#c084fc";
                if (className.includes("pink")) return "#f472b6";
                if (className.includes("orange")) return "#fb923c";
                if (className.includes("teal")) return "#2dd4bf";
                return "#8b5cf6";
              };

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorFromClassName(config.color)}
                />
              );
            })}
          </Pie>

          <Tooltip content={<CustomToolTip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
