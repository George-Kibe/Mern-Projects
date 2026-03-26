import { useExpenseStore } from "@/store/expenseStore";
import { MonthlyTotal } from "@/types/analytics.types";
import { useNavigate } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface YealyOverviewChartProps {
  data: MonthlyTotal[];
  year: number;
}

interface ChartDataItem extends MonthlyTotal {
  monthName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const [monthStr, yearStr] = data.month.split("-");
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
    const monthName = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="bg-slate-800 border border-purple-700 rounded-sm p-3">
        <p className="text-gray-100 font-medium">{monthName}</p>
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

export default function YearlyOverviewChart({
  data,
  year,
}: YealyOverviewChartProps) {
  const navigate = useNavigate();
  const { setDateRange } = useExpenseStore();

  function handleBarClick(data: ChartDataItem) {
    const [monthStr, yearStr] = data.month.split("-");
    const monthNum = parseInt(monthStr);
    const startDate = `${yearStr}-${monthStr}-01`;
    const lastDay = new Date(parseInt(yearStr), monthNum, 0).getDate();
    const endDate = `${yearStr}-${monthStr}-${lastDay.toString().padStart(2, "0")}`;

    setDateRange(startDate, endDate);
    navigate({ to: "/expenses" });
  }

  const chartData: ChartDataItem[] = data.map((item) => {
    const [monthStr, yearStr] = item.month.split("-");
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    return { ...item, monthName };
  });

  return (
    <div className="flex flex-col gap-4  border border-purple-950 rounded-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-100">Yearly Overview</h3>
        <p className="text-sm text-gray-400 mt-1">{year}</p>
      </div>

      <ResponsiveContainer width="100%" height={550}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 15 }}
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

          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1f2937" }} />
          <Bar
            dataKey="total"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            onClick={(data) => {
              if (data && data.payload) {
                handleBarClick(data.payload as ChartDataItem);
              }
            }}
            className="cursor-pointer"
          >
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
