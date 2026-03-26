import { Expense } from "@/types";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  expense: Expense | undefined;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  expense,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmationModalProps) {
  if (!isOpen || !expense) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 rounded-sm border border-red-900 w-full max-w-md">
        <div className="flex items-center gap-3 p-6 border-b border-slate-800">
          <div className="p-2 bg-red-900/20 rounded-sm">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-100">Delete Expense</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </p>

          <div className="p-4 bg-slate-800 rounded-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-gray-100 font-mono font-bold">
                ${expense.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Description:</span>
              <span className="text-gray-100">{expense.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Category:</span>
              <span className="text-gray-100 capitalize">
                {expense.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 text-gray-100 rounded-sm border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-red-900 text-gray-100 rounded-sm border border-red-800 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
