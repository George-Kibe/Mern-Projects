import { useExpenseStore } from "@/store/expenseStore";
import { AllYears } from "@/types/analytics.types";
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

interface AllYearsChartProps {
  data: AllYears[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AllYears;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-purple-700 rounded-sm p-3">
        <p className="text-gray-100 font-medium">{data.year}</p>
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

export default function AllYearsChart({ data }: AllYearsChartProps) {
  const navigate = useNavigate();
  const { setDateRange } = useExpenseStore();

  function handleBarClick(data: AllYears) {
    const year = data.year;
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    setDateRange(startDate, endDate);
    navigate({ to: "/expenses" });
  }

  return (
    <div className="flex flex-col gap-4 border border-purple-950 rounded-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-100">
          All Years Overview
        </h3>
        <p className="text-sm text-gray-400 mt-1">Total spending by year</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="year" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1f2937" }} />
          <Bar
            dataKey="total"
            fill="#4ade80"
            radius={[4, 4, 0, 0]}
            onClick={(data) => {
              if (data && data.payload) {
                handleBarClick(data.payload as AllYears);
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
