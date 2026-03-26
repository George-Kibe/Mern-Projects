import { NextFunction, Request, Response } from "express";
import { ExpenseCategory } from "../types";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers";
import { AppError } from "../middleware/errorHandler";
import Expense from "../models/Expense";
import User from "../models/User";

// export let fakeExpenses: Expense[] = [
//   {
//     id: "1",
//     userId: "user123",
//     amount: 45.99123456789,
//     category: ExpenseCategory.FOOD,
//     description: "Lunch at restaurant",
//     date: new Date("2025-10-15"),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "2",
//     userId: "user123",
//     amount: 20.0,
//     category: ExpenseCategory.TRANSPORT,
//     description: "Uber to work",
//     date: new Date("2025-10-14"),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "3",
//     userId: "user123",
//     amount: 12.5,
//     category: ExpenseCategory.FOOD,
//     description: "Snacks",
//     date: new Date("2024-02-11"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "4",
//     userId: "user123",
//     amount: 85.0,
//     category: ExpenseCategory.SHOPPING,
//     description: "Winter jacket",
//     date: new Date("2024-04-03"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "5",
//     userId: "user123",
//     amount: 35.99,
//     category: ExpenseCategory.ENTERTAINMENT,
//     description: "Concert ticket",
//     date: new Date("2024-08-21"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "6",
//     userId: "user123",
//     amount: 14.2,
//     category: ExpenseCategory.FOOD,
//     description: "Coffee",
//     date: new Date("2025-01-15"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "7",
//     userId: "user123",
//     amount: 62.0,
//     category: ExpenseCategory.UTILITIES,
//     description: "Electric bill",
//     date: new Date("2025-02-07"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "8",
//     userId: "user123",
//     amount: 27.5,
//     category: ExpenseCategory.TRANSPORT,
//     description: "Train pass",
//     date: new Date("2025-03-12"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "9",
//     userId: "user123",
//     amount: 110.0,
//     category: ExpenseCategory.HEALTHCARE,
//     description: "Dentist appointment",
//     date: new Date("2025-04-18"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "10",
//     userId: "user123",
//     amount: 48.3,
//     category: ExpenseCategory.FOOD,
//     description: "Groceries run",
//     date: new Date("2025-05-09"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "11",
//     userId: "user123",
//     amount: 92.0,
//     category: ExpenseCategory.EDUCATION,
//     description: "Books",
//     date: new Date("2025-06-22"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "12",
//     userId: "user123",
//     amount: 55.75,
//     category: ExpenseCategory.ENTERTAINMENT,
//     description: "Cinema night",
//     date: new Date("2025-07-04"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "13",
//     userId: "user123",
//     amount: 140.0,
//     category: ExpenseCategory.SHOPPING,
//     description: "New shoes",
//     date: new Date("2025-08-15"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "14",
//     userId: "user123",
//     amount: 19.5,
//     category: ExpenseCategory.FOOD,
//     description: "Breakfast",
//     date: new Date("2025-09-01"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "15",
//     userId: "user123",
//     amount: 210.0,
//     category: ExpenseCategory.UTILITIES,
//     description: "Water bill",
//     date: new Date("2025-10-11"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "16",
//     userId: "user123",
//     amount: 33.0,
//     category: ExpenseCategory.TRANSPORT,
//     description: "Bus reload",
//     date: new Date("2025-11-03"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "17",
//     userId: "user123",
//     amount: 300.0,
//     category: ExpenseCategory.HEALTHCARE,
//     description: "Prescription meds",
//     date: new Date("2025-11-25"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "18",
//     userId: "user123",
//     amount: 72.4,
//     category: ExpenseCategory.EDUCATION,
//     description: "Online course",
//     date: new Date("2025-12-01"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "19",
//     userId: "user123",
//     amount: 15.0,
//     category: ExpenseCategory.OTHER,
//     description: "Random purchase",
//     date: new Date("2025-12-05"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
//   {
//     id: "20",
//     userId: "user123",
//     amount: 250.0,
//     category: ExpenseCategory.SHOPPING,
//     description: "New monitor",
//     date: new Date("2025-12-08"),
//     createdAt: new Date("2025-12-09"),
//     updatedAt: new Date("2025-12-09"),
//   },
// ];

export const getAllExpenses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { category, sort } = req.query;

    const filter: { userId: string; category?: string } = {
      userId,
    };

    if (category && typeof category === "string") {
      filter.category = category;
    }

    let query = Expense.find(filter);

    if (sort && typeof sort === "string") {
      if (sort === "amount") {
        query = query.sort({ amount: 1 });
      } else if (sort === "-amount") {
        query = query.sort({ amount: -1 });
      } else if (sort === "date") {
        query = query.sort({ date: 1 });
      } else if (sort === "-date") {
        query = query.sort({ date: -1 });
      }
    }

    const expenses = await query;

    sendSuccess(res, expenses, `Found ${expenses.length} expenses.`);
  },
);

export const getExpenseById = asyncHandler(
  async (req: Request, res: Response, nex: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      throw new AppError("Expense Not Found", 404);
    }

    if (expense.userId.toString() !== userId) {
      throw new AppError("Unauthorized access to this expense", 403);
    }

    sendSuccess(res, expense, "Expense retrieved successfully");
  },
);

export const createExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { amount, category, description, date } = req.body;

    if (!amount) {
      throw new AppError("Amount is required", 400);
    }
    if (!category) {
      throw new AppError("Category is required", 400);
    }
    if (!description) {
      throw new AppError("Description is required", 400);
    }

    // Validation - Data Types
    if (typeof amount !== "number") {
      throw new AppError("Amount must be a number", 400);
    }

    // Validation - Business Logic
    if (amount <= 0) {
      throw new AppError("Amount must be greater than 0", 400);
    }

    if (amount > 1000000) {
      throw new AppError("Amount cannot exceed 1,000,000", 400);
    }

    // Validation - Category
    const validCategories = Object.values(ExpenseCategory);
    if (!validCategories.includes(category)) {
      throw new AppError(
        `Invalid category. Must be on of: ${validCategories.join(", ")}`,
        400,
      );
    }

    // Validation - Desc
    if (description.length < 3) {
      throw new AppError("Description must be at least 3 characters", 400);
    }
    if (description.length > 100) {
      throw new AppError("Description cannot exceed 100 characters", 400);
    }

    const expenseDate = date ? new Date(date) : new Date();
    const today = new Date();

    if (expenseDate > today) {
      throw new AppError("Cannot create an expense for a future date", 400);
    }

    const newExpense = new Expense({
      userId: userId,
      amount,
      category,
      description,
      date: expenseDate,
    });

    const createdExpense = await newExpense.save();

    sendSuccess(res, createdExpense, "Expense created successfully!", 201);
  },
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      throw new AppError("Expense Not Found", 404);
    }

    if (expense.userId.toString() !== userId) {
      throw new AppError("Unauthorized access to this expense", 403);
    }

    // Validation - Provided Fields
    if (amount !== undefined) {
      if (typeof amount !== "number") {
        throw new AppError("Amount must be a number", 400);
      }

      if (amount <= 0) {
        throw new AppError("Amount must be greater than 0", 400);
      }

      if (amount > 1000000) {
        throw new AppError("Amount cannot exceed 1,000,000", 400);
      }
    }

    if (category !== undefined) {
      const validCategories = Object.values(ExpenseCategory);
      if (!validCategories.includes(category)) {
        throw new AppError(
          `Invalid category. Must be one of: ${validCategories.join(", ")}`,
          400,
        );
      }
    }

    if (description !== undefined) {
      if (description.length < 3) {
        throw new AppError("Description must be at least 3 characters", 400);
      }
      if (description.length > 100) {
        throw new AppError("Description cannot exceed 100 characters", 400);
      }
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (description !== undefined) {
      expense.description = description;
    }

    if (date !== undefined) {
      expense.date = new Date(date);
    }

    const updatedExpense = await expense.save();

    sendSuccess(res, updatedExpense, "Expense updated successfully!");
  },
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      throw new AppError("Expense Not Found", 404);
    }

    if (expense.userId.toString() !== userId) {
      throw new AppError("Unauthorized access to this expense", 403);
    }

    await Expense.findByIdAndDelete(id);

    sendSuccess(res, null, "Expense deleted successfully!");
  },
);
