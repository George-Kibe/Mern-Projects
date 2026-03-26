import { ExpenseCategory } from "@/types";

export const categoryConfig = {
  [ExpenseCategory.FOOD]: {
    emoji: "🍔",
    label: "Food & Dining",
    color: "bg-orange-900/30 text-orange-400 border-orange-800",
  },
  [ExpenseCategory.TRANSPORT]: {
    emoji: "🚗",
    label: "Transportation",
    color: "bg-blue-900/30 text-blue-400 border-blue-800",
  },
  [ExpenseCategory.UTILITIES]: {
    emoji: "💡",
    label: "Utilities",
    color: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
  },
  [ExpenseCategory.ENTERTAINMENT]: {
    emoji: "🎮",
    label: "Entertainment",
    color: "bg-purple-900/30 text-purple-400 border-purple-800",
  },
  [ExpenseCategory.HEALTHCARE]: {
    emoji: "🏥",
    label: "Healthcare",
    color: "bg-cyan-900/30 text-cyan-400 border-cyan-800",
  },
  [ExpenseCategory.SHOPPING]: {
    emoji: "🛍️",
    label: "Shopping",
    color: "bg-pink-900/30 text-pink-400 border-pink-800",
  },
  [ExpenseCategory.EDUCATION]: {
    emoji: "📚",
    label: "Education",
    color: "bg-green-900/30 text-green-400 border-green-800",
  },
  [ExpenseCategory.OTHER]: {
    emoji: "📌",
    label: "Other",
    color: "bg-gray-900/30 text-gray-400 border-gray-800",
  },
};

export const getCategoryConfig = (category: string) => {
  return (
    categoryConfig[category as ExpenseCategory] ||
    categoryConfig[ExpenseCategory.OTHER]
  );
};
