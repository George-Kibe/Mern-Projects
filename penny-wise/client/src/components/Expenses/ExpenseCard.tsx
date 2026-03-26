import { Expense } from "@/types";
import { getCategoryConfig } from "@/utils/CategoryConfig";
import { Calendar, Pencil, Trash2 } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const categoryInfo = getCategoryConfig(expense.category);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  function formatAmount(amount: number) {
    return `$${amount.toFixed(2)}`;
  }

  return (
    <div className="flex flex-col gap-4  border border-purple-950 rounded-sm p-6 hover:border-purple-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium border ${categoryInfo.color}`}
        >
          <span className="text-base">{categoryInfo.emoji}</span>
          <span>{categoryInfo.label}</span>
        </div>

        <span className="text-2xl font-bold text-gray-100 font-mono">
          {formatAmount(expense.amount)}
        </span>
      </div>

      <p className="text-gray-300 text-base">{expense.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="size-4" />
          <span>{formatDate(expense.date)}</span>
        </div>

        <div>
          <button
            onClick={() => onEdit(expense)}
            title="Edit Expense"
            className="p-2 text-gray-500 hover:text-blue-400 transition-colors opacity-50"
          >
            <Pencil className="size-4" />
          </button>

          <button
            onClick={() => onDelete(expense)}
            title="Delete Expense"
            className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
