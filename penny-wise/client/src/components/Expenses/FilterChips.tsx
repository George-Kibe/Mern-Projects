import { useExpenseStore } from "@/store/expenseStore";
import { X } from "lucide-react";

export default function FilterChips() {
  const { filters, removeFilter } = useExpenseStore();

  const activeFilters: { type: string; label: string }[] = [];

  if (filters.category && filters.category !== "all") {
    activeFilters.push({
      type: "category",
      label: `Category: ${filters.category}`,
    });
  }

  if (filters.sort && filters.sort !== "-date") {
    const sortLabels: { [key: string]: string } = {
      "-date": "Date (Newest First)",
      date: "Date (Oldest First)",
      "-amount": "Amount (High to Low)",
      amount: "Amount (Low to High)",
    };

    activeFilters.push({
      type: "sort",
      label: `Sort: ${sortLabels[filters.sort] || filters.sort}`,
    });
  }

  if (filters.searchTerm) {
    activeFilters.push({
      type: "search",
      label: `Search: "${filters.searchTerm}"`,
    });
  }

  if (filters.startDate || filters.endDate) {
    const start = filters.startDate || "Any";
    const end = filters.endDate || "Any";

    activeFilters.push({
      type: "dateRange",
      label: `Date: ${start} to ${end}`,
    });
  }

  if (filters.minAmount || filters.maxAmount) {
    const min = filters.minAmount || "Any";
    const max = filters.maxAmount || "Any";

    activeFilters.push({
      type: "amountRange",
      label: `Amount: ${min} to ${max}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <div
          key={filter.type}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 border border-purple-800 rounded-full text-sm text-purple-300"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => removeFilter(filter.type)}
            className="hover:text-purple-100 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
