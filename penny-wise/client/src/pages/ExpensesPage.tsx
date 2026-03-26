import DeleteConfirmationModal from "@/components/Expenses/DeleteConfirmationModal";
import ExpenseModal from "@/components/Expenses/ExpenseModal";
import ExpenseFilters from "@/components/Expenses/ExpensesFilters";
import ExpensesList from "@/components/Expenses/ExpensesList";
import { useExpenseStore } from "@/store/expenseStore";
import { Expense } from "@/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function ExpensesPage() {
  const { isLoading, getAllExpenses, deleteExpense } = useExpenseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined,
  );
  const [deletingExpense, setDeletingExpense] = useState<Expense | undefined>(
    undefined,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    getAllExpenses();
  }, [getAllExpenses]);

  function handleEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  function handleAddExpense() {
    setEditingExpense(undefined);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setEditingExpense(undefined);
    setIsModalOpen(false);
  }

  function handleDeleteExpense(expense: Expense) {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingExpense) return;

    await deleteExpense(deletingExpense._id);

    const { error: deleteError } = useExpenseStore.getState();

    if (!deleteError) {
      setIsDeleteModalOpen(false);
      setDeletingExpense(undefined);
    }
  }

  function handleCancelDelete() {
    setIsDeleteModalOpen(false);
    setDeletingExpense(undefined);
  }

  return (
    <main className="bg-slate-950 px-4 py-8 sm:px-8 sm:py-12">
      <div className="border-b border-purple-950 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Expenses</h1>
          <p className="text-gray-400 mt-1">Manage and track your expenses</p>
        </div>
        <button
          onClick={handleAddExpense}
          className="flex items-center gap-2 px-6 py-3 bg-purple-950 text-gray-100 rounded-sm hover:bg-purple-800 transition font-medium"
        >
          <Plus className="size-5" /> Add Expense
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-24">
          <p className="text-gray-400 text-lg">Loading expenses...</p>
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col gap-6">
          <ExpenseFilters />

          <ExpensesList
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        </div>
      )}

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        expense={deletingExpense}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isLoading}
      />
    </main>
  );
}
