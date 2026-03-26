import { useExpenseStore } from "@/store/expenseStore";
import { ExpenseCategory } from "@/types";
import { YearlyCategoryStats } from "@/types/analytics.types";
import { getCategoryConfig } from "@/utils/CategoryConfig";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

interface YearlyCategoryChartProps {
  data: YearlyCategoryStats[];
  year: number;
}

interface ChartDataItem {
  month: string;
  monthName: string;
  [category: string]: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: ChartDataItem;
  }>;
  activeCategory?: string | null;
}

const CustomTooltip = ({
  active,
  payload,
  activeCategory,
}: CustomTooltipProps) => {
  if (active && payload && payload.length > 0 && activeCategory) {
    const hoveredSegment = payload.find((p) => p.dataKey === activeCategory);
    if (hoveredSegment && hoveredSegment.value > 0) {
      const category = hoveredSegment.dataKey;
      const amount = hoveredSegment.value;
      const count = hoveredSegment.payload[activeCategory + "_count"];
      const config = getCategoryConfig(category);
      const monthData = hoveredSegment.payload;
      const [monthStr, yearStr] = monthData.month.split("-");
      const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      return (
        <div className="bg-slate-800 border border-purple-700 rounded-sm p-3">
          <p className="text-gray-100 font-medium mb-2">{monthName}</p>
          <p className="text-gray-300 text-sm">
            {config.emoji} {config.label}
          </p>
          <p className="text-purple-400 font-bold">${amount.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">
            {count} expense{count === 1 ? "" : "s"}
          </p>
        </div>
      );
    }
  }
  return null;
};

export default function YearlyCategoryChart({
  data,
  year,
}: YearlyCategoryChartProps) {
  const navigate = useNavigate();
  const { setCategory, setDateRange } = useExpenseStore();

  const [bottomMargin, setBottomMargin] = useState(80);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setBottomMargin(window.innerWidth < 1024 ? 80 : 5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleSegmentClick(data: ChartDataItem, category: string) {
    const [monthStr, yearStr] = data.month.split("-");
    const monthNum = parseInt(monthStr);
    const startDate = `${yearStr}-${monthStr}-01`;
    const lastDay = new Date(parseInt(yearStr), monthNum, 0).getDate();
    const endDate = `${yearStr}-${monthStr}-${lastDay.toString().padStart(2, "0")}`;

    setCategory(category);
    setDateRange(startDate, endDate);
    navigate({ to: "/expenses" });
  }
  const allCategories = Object.values(ExpenseCategory);

  const chartData = data.map((monthData) => {
    const [monthStr, yearStr] = String(monthData.month).split("-");
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1);

    const chartItem: ChartDataItem = {
      month: String(monthData.month),
      monthName: date.toLocaleDateString("en-US", { month: "short" }),
    };

    allCategories.forEach((category) => {
      chartItem[category] = 0;
      chartItem[category + "_count"] = 0;
    });

    monthData.categories.forEach((cat) => {
      chartItem[cat.category] = cat.total;
      chartItem[cat.category + "_count"] = cat.count;
    });

    return chartItem;
  });

  const getColorFromClassName = (className: string): string => {
    if (className.includes("green")) return "#4ade80";
    if (className.includes("blue")) return "#60a5fa";
    if (className.includes("red")) return "#f87171";
    if (className.includes("yellow")) return "#fbbf24";
    if (className.includes("purple")) return "#c084fc";
    if (className.includes("pink")) return "#f472b6";
    if (className.includes("orange")) return "#fb923c";
    return "#8b5cf6";
  };

  return (
    <div className="flex flex-col gap-4 border border-purple-950 rounded-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-100">
          Yearly by Category
        </h3>
        <p className="text-sm text-gray-400 mt-1">{year}</p>
      </div>

      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: bottomMargin }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="monthName"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af" }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af" }}
            tickFormatter={(value) => `$${value}`}
          />

          <Tooltip
            content={<CustomTooltip activeCategory={activeCategory} />}
            cursor={{ fill: "#1f2937" }}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: "30px", paddingBottom: "10px" }}
            formatter={(value) => {
              const config = getCategoryConfig(value);
              return `${config.emoji} ${config.label}`;
            }}
          />

          {allCategories.map((category) => {
            const config = getCategoryConfig(category);
            const color = getColorFromClassName(config.color);

            return (
              <Bar
                key={category}
                dataKey={category}
                stackId="a"
                fill={color}
                onMouseEnter={() => setActiveCategory(category)}
                onMouseLeave={() => setActiveCategory(null)}
                onClick={(data) => {
                  if (data && data.payload) {
                    handleSegmentClick(data.payload as ChartDataItem, category);
                  }
                }}
                className="cursor-pointer"
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
