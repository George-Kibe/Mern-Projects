import { useExpenseStore } from "@/store/expenseStore";
import { Package } from "lucide-react";
import ExpenseCard from "./ExpenseCard";
import { Expense } from "@/types";
import { useMemo } from "react";
import ResultsSummary from "./ResultsSummary";
import Pagination from "./Pagination";

interface ExpenseListProps {
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export default function ExpensesList({ onEdit, onDelete }: ExpenseListProps) {
  const { expenses, filters, page, itemsPerPage } = useExpenseStore();

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter((expense) => {
        const descriptionMatch = expense.description
          .toLowerCase()
          .includes(searchLower);
        const categoryMatch = expense.category
          .toLowerCase()
          .includes(searchLower);
        const amountMatch = expense.amount.toString().includes(searchLower);

        return descriptionMatch || categoryMatch || amountMatch;
      });
    }

    if (filters.startDate) {
      result = result.filter((expense) => {
        const expenseDate = expense.date.split("T")[0];
        return expenseDate >= filters.startDate!;
      });
    }

    if (filters.endDate) {
      result = result.filter((expense) => {
        const expenseDate = expense.date.split("T")[0];
        return expenseDate <= filters.endDate!;
      });
    }

    if (filters.minAmount !== null) {
      result = result.filter((expense) => expense.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== null) {
      result = result.filter((expense) => expense.amount <= filters.maxAmount!);
    }

    return result;
  }, [expenses, filters]);

  const displayedExpenses = useMemo(() => {
    const endIndex = page * itemsPerPage;
    return filteredExpenses.slice(0, endIndex);
  }, [filteredExpenses, page, itemsPerPage]);

  const hasMore = useMemo(() => {
    return filteredExpenses.length > displayedExpenses.length;
  }, [filteredExpenses.length, displayedExpenses.length]);

  const getEmptyMessage = () => {
    const hasActiveFilters =
      filters.searchTerm ||
      filters.startDate ||
      filters.endDate ||
      filters.minAmount !== null ||
      filters.maxAmount !== null ||
      (filters.category && filters.category !== "all") ||
      (filters.sort && filters.sort !== "-date");

    if (hasActiveFilters) {
      return "No expenses match your filters";
    }

    return "No expenses found";
  };

  const getEmptyHint = () => {
    const hasActiveFilters =
      filters.searchTerm ||
      filters.startDate ||
      filters.endDate ||
      filters.minAmount !== null ||
      filters.maxAmount !== null ||
      (filters.category && filters.category !== "all") ||
      (filters.sort && filters.sort !== "-date");

    if (hasActiveFilters) {
      return "Try adjusting or clearing your filters";
    }

    return "Start by adding your first expense";
  };

  return (
    <section className="col-span-4 flex flex-col gap-6">
      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Package className="size-24 text-gray-700" strokeWidth={1} />
          <div className="text-center">
            <p className="text-xl text-gray-400 font-medium">
              {getEmptyMessage()}
            </p>
            <p className="text-gray-500 mt-1">{getEmptyHint()}</p>
          </div>
        </div>
      ) : (
        <>
          <ResultsSummary expenses={filteredExpenses} />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">
              {filters.category && filters.category !== "all"
                ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Expenses`
                : "Your Expenses"}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredExpenses.length} expense
              {filteredExpenses.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedExpenses.map((expense) => (
              <ExpenseCard
                expense={expense}
                key={expense._id}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          <Pagination
            displayedCount={displayedExpenses.length}
            totalCount={filteredExpenses.length}
            hasMore={hasMore}
          />
        </>
      )}
    </section>
  );
}
