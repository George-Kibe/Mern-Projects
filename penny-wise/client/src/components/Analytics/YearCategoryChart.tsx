import { useExpenseStore } from "@/store/expenseStore";
import { CategoryTotal } from "@/types/analytics.types";
import { getCategoryConfig } from "@/utils/CategoryConfig";
import { useNavigate } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface YearCategoryChartProps {
  data: CategoryTotal[];
  year: number;
}

interface ChartDataItem {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const config = getCategoryConfig(data.category);

    return (
      <div className="bg-slate-800 border border-purple-700 rounded-sm p-3">
        <p className="text-gray-100 font-medium">
          {config.emoji} {config.label}
        </p>
        <p className="text-purple-400 font-bold text-lg">
          ${data.total.toFixed(2)}
        </p>
        <p className="text-gray-400 text-sm">
          {data.count} expense{data.count === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  return null;
};

export default function YearCategoryChart({
  data,
  year,
}: YearCategoryChartProps) {
  const navigate = useNavigate();
  const { setCategory, setDateRange } = useExpenseStore();

  function handleBarClick(entry: ChartDataItem) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    setCategory(entry.category);
    setDateRange(startDate, endDate);
    navigate({ to: "/expenses" });
  }

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

  const chartData: ChartDataItem[] = data.map((item) => ({
    category: item.category,
    total: item.total,
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="flex flex-col gap-4 border border-purple-950 rounded-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-100">
          {year} by Category
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Total spending per category
        </p>
      </div>

      <ResponsiveContainer width="100%" height={550}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="category"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af" }}
            angle={-45}
            textAnchor="end"
            height={80}
            tickFormatter={(value) => {
              const config = getCategoryConfig(value);
              return `${config.emoji} ${config.label}`;
            }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af" }}
            tickFormatter={(value) => `$${value}`}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1f2937" }} />

          <Bar
            dataKey="total"
            radius={[4, 4, 0, 0]}
            onClick={(data) => {
              if (data && data.payload) {
                handleBarClick(data.payload as ChartDataItem);
              }
            }}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => {
              const config = getCategoryConfig(entry.category);
              const color = getColorFromClassName(config.color);
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
            <LabelList
              dataKey="total"
              position="top"
              formatter={(value) => `$${Number(value).toFixed(0)}`}
              fill="#e5e7eb"
              style={{ fontSize: "12px", fontWeight: "600" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
