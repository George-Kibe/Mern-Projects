import { X } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import { useExpenseStore } from "@/store/expenseStore";
import { Expense } from "@/types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  expense,
}: ExpenseModalProps) {
  const { clearError } = useExpenseStore();

  if (!isOpen) return null;

  function handleClose() {
    onClose();
    clearError();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-slate-900 rounded-sm border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-gray-100">Add new expense</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-100 transition-colors rounded-sm hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </div>
        <ExpenseForm onSuccess={handleClose} expense={expense} />
      </div>
    </div>
  );
}
