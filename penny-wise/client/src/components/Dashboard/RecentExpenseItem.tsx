import { Expense } from "@/types";
import { getCategoryConfig } from "@/utils/CategoryConfig";

interface RecentExpenseItemProps {
  expense: Expense;
  onClick: (expense: Expense) => void;
}

export default function RecentExpenseItem({
  expense,
  onClick,
}: RecentExpenseItemProps) {
  const categoryConfig = getCategoryConfig(expense.category);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => onClick(expense)}
      className="flex items-center justify-between p-4 border border-purple-950 rounded-sm hover:border-purple-700 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium border ${categoryConfig.color}`}
        >
          <span className="text-base">{categoryConfig.emoji}</span>
          <span>{categoryConfig.label}</span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-100 font-medium">{expense.description}</p>

          <p className="text-gray-500 text-sm">{formatDate(expense.date)}</p>
        </div>
      </div>

      <p className="text-xl font-bold text-gray-100 font-mono">
        ${expense.amount.toFixed(2)}
      </p>
    </div>
  );
}
