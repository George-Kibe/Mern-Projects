import { useExpenseStore } from "@/store/expenseStore";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const { filters, setSearchTerm } = useExpenseStore();

  const [inputValue, setInputValue] = useState(filters.searchTerm || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, setSearchTerm]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="search" className="text-sm font-medium text-gray-400">
        Search Expenses
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />

        <input
          key={filters.searchTerm}
          id="search"
          type="text"
          defaultValue={filters.searchTerm || ""}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search by description, category, or amount..."
          className="w-full pl-10 pr-4 py-2.5 bg-purple-950 rounded-sm text-gray-100 border-none outline-none"
        />
      </div>
    </div>
  );
}
