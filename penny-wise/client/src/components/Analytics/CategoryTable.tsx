import { useExpenseStore } from "@/store/expenseStore";
import { CategoryTotal } from "@/types/analytics.types";
import { getCategoryConfig } from "@/utils/CategoryConfig";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

interface CategoryTableProps {
  data: CategoryTotal[];
}

type SortColumn = "category" | "total" | "percentage" | "count";
type SortDirection = "asc" | "desc";

export default function CategoryTable({ data }: CategoryTableProps) {
  const navigate = useNavigate();
  const { setCategory } = useExpenseStore();

  const [sortColumn, setSortColumn] = useState<SortColumn>("total");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  function handleRowClick(category: string) {
    setCategory(category);
    navigate({ to: "/expenses" });
  }

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === "category") {
      const aLabel = getCategoryConfig(a.category).label;
      const bLabel = getCategoryConfig(b.category).label;
      comparison = aLabel.localeCompare(bLabel);
    } else {
      comparison = a[sortColumn] - b[sortColumn];
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const total = data.reduce((sum, item) => sum + item.total, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="border border-purple-950 rounded-sm overflow-hidden">
      <div className="p-6 border-b border-purple-950">
        <h3 className="text-lg font-semibold text-gray-100">
          Category Breakdown
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          All-time spending by category
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort("category")}
              >
                Category
                {sortColumn === "category" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort("total")}
              >
                Amount
                {sortColumn === "total" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort("percentage")}
              >
                Percentage
                {sortColumn === "percentage" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort("count")}
              >
                Count
                {sortColumn === "count" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {sortedData.map((item, index) => {
              const config = getCategoryConfig(item.category);

              return (
                <tr
                  key={item.category}
                  className={`cursor-pointer hover:bg-slate-800 transition-colors ${
                    index % 2 === 0 ? "bg-slate-900/50" : "bg-slate-950"
                  }`}
                  onClick={() => handleRowClick(item.category)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{config.emoji}</span>
                      <span className="text-sm font-medium text-gray-100">
                        {config.label}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-100">
                    ${item.total.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                    {item.percentage.toFixed(1)}%
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                    {item.count}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-slate-900 border-t border-purple-950">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-100">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-100">
                ${total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-100">
                100%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-100">
                {totalCount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
