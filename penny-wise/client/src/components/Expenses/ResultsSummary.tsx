import { Expense } from "@/types";

interface ResultsSummaryProps {
  expenses: Expense[];
}

export default function ResultsSummary({ expenses }: ResultsSummaryProps) {
  const numberOfExpenses = expenses.length;
  const totalAmountOfExpenses = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );
  const avgAmountOfExpenses =
    numberOfExpenses > 0 ? totalAmountOfExpenses / numberOfExpenses : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-purple-950 rounded-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-400">Total Expenses</span>

        <span className="text-2xl font-bold text-gray-100">
          {numberOfExpenses} {numberOfExpenses === 1 ? "expense" : "expenses"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-400">Total Amount</span>

        <span className="text-2xl font-bold text-purple-400">
          ${totalAmountOfExpenses}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-400">Average Amount</span>
        <span className="text-2xl font-bold text-gray-100">
          ${avgAmountOfExpenses.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
