import { useExpenseStore } from "@/store/expenseStore";
import { SpendingTrend } from "@/types/analytics.types";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendLineChartProps {
  data: SpendingTrend[];
}

interface CustomToolTipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      total: number;
      month: string;
      count: number;
    };
  }>;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: SpendingTrend;
}

const formatMonth = (monthString: string) => {
  const [month, year] = monthString.split("-");

  const date = new Date(parseFloat(year), parseFloat(month) - 1);
  return date.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
  });
};

const CustomToolTip = ({ active, payload }: CustomToolTipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-slate-800 border border-purple-700 rounded-sm p-3">
        <p className="text-gray-400 text-sm">{formatMonth(data.month)}</p>
        <p className="text-purple-400 font-bold">${data.total.toFixed(2)}</p>
        <p className="text-gray-400 text-sm">
          {data.count} expense{data.count === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  return null;
};

export default function TrendLineChart({ data }: TrendLineChartProps) {
  const navigate = useNavigate();
  const { setDateRange } = useExpenseStore();
  const [chartHeight, setChartHeight] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerWidth < 640 ? 300 : 550);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handlePointClick(data: SpendingTrend) {
    const [monthNum, year] = data.month.split("-");

    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(
      parseFloat(year),
      parseFloat(monthNum),
      0,
    ).getDate();
    const endDate = `${year}-${monthNum}-${lastDay.toString().padStart(2, "0")}`;

    setDateRange(startDate, endDate);
    navigate({ to: "/expenses" });
  }

  const customDot = (props: DotProps) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#8b5cf6"
        className="cursor-pointer"
        onClick={() => handlePointClick(payload)}
      />
    );
  };

  const customActiveDot = (props: DotProps) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#8b5cf6"
        className="cursor-pointer"
        onClick={() => handlePointClick(payload)}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4 p-6  border border-purple-950 rounded-sm">
      <h3 className="text-lg font-semibold text-gray-100">Spending Trend</h3>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#94a3b8" />
          <YAxis tickFormatter={(value) => `$${value}`} stroke="#94a3b8" />
          <Tooltip content={<CustomToolTip />} />

          <Line
            type="monotone"
            dataKey="total"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={customDot}
            activeDot={customActiveDot}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
