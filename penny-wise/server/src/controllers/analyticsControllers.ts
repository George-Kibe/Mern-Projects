import { NextFunction, Request, Response } from "express";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers";
import { AppError } from "../middleware/errorHandler";
import { DashboardStats, ExpenseCategory, MonthlyTotals } from "../types";
import Expense from "../models/Expense";
import User from "../models/User";

const getMonthString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}-${year}`;
};

const getCurrentMonth = (): string => {
  return getMonthString(new Date());
};

const getLastMonth = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return getMonthString(date);
};

export const getExpensesByCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userExpenses = await Expense.find({ userId });

    if (userExpenses.length === 0) {
      sendSuccess(
        res,
        [],
        "No expenses found. Create an expense to get started.",
      );
      return;
    }

    const categoryTotals = userExpenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = { total: 0, count: 0 };
        }

        acc[expense.category].total += expense.amount;
        acc[expense.category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    const grandTotal = Object.values(categoryTotals).reduce(
      (sum, cat) => sum + cat.total,
      0,
    );

    const categoryArray = Object.entries(categoryTotals).map(
      ([category, cat]) => ({
        category,
        ...cat,
        percentage: Math.round((cat.total / grandTotal) * 1000) / 10,
        total: Math.round(cat.total * 100) / 100,
      }),
    );

    categoryArray.sort((a, b) => b.total - a.total);
    sendSuccess(res, categoryArray, "Category breakdown retrieved!");
  },
);

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userExpenses = await Expense.find({ userId });

    if (userExpenses.length === 0) {
      sendSuccess(
        res,
        [],
        "No expenses found. Create an expense to get started.",
      );
      return;
    }

    const totalExpenses = userExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );

    const averageExpense = totalExpenses / userExpenses.length;
    const roundedAverageExpenseAmount = Math.round(averageExpense * 10) / 10;

    const amounts = userExpenses.map((exp) => exp.amount);
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts);

    const highestExpense = userExpenses.find(
      (exp) => exp.amount === maxAmount,
    )!;
    const lowestExpense = userExpenses.find((exp) => exp.amount === minAmount)!;

    const currentMonth = getCurrentMonth();
    const currentMonthExpenses = userExpenses.filter(
      (exp) => getMonthString(new Date(exp.date)) === currentMonth,
    );
    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );

    const lastMonth = getLastMonth();
    const lastMonthExpenses = userExpenses.filter(
      (exp) => getMonthString(new Date(exp.date)) === lastMonth,
    );
    const lastMonthTotal = lastMonthExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );

    let monthlyChange = 0;

    // lastMonthTotal = 400
    // currentMonthTotal = 500
    // 500 - 400 = 100$
    // ((thisMonth - lastMonth) / (lastMonth)) * 100
    // 100 / 400 = 0.25 * 100 = 25%
    if (lastMonthTotal > 0) {
      monthlyChange =
        ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      monthlyChange = Math.round(monthlyChange * 10) / 10;
    } else if (currentMonthTotal > 0) {
      monthlyChange = 100;
    }

    const stats: DashboardStats = {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      expenseCount: userExpenses.length,
      roundedAverageExpenseAmount,
      highestExpense,
      lowestExpense,
      lastMonthTotal: Math.round(lastMonthTotal * 100) / 100,
      currentMonthTotal: Math.round(currentMonthTotal * 100) / 100,
      monthlyChange,
    };

    sendSuccess(res, stats, "Dashbaord statistics rerieved.");
  },
);

export const getSpendingTrends = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userExpenses = await Expense.find({ userId });

    if (userExpenses.length === 0) {
      sendSuccess(
        res,
        [],
        "No expenses found. Create an expense to get started.",
      );
      return;
    }

    const trends = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const monthString = getMonthString(date);

      const monthExpenses = userExpenses.filter(
        (exp) => getMonthString(new Date(exp.date)) === monthString,
      );
      const monthTotal = monthExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      );

      trends.push({
        month: monthString,
        total: Math.round(monthTotal * 100) / 100,
        count: monthExpenses.length,
      });
    }

    sendSuccess(res, trends, "Spending trends retrieved.");
  },
);

export const getPeriodStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const days = Number(req.query.days);

    if (isNaN(days)) {
      throw new AppError("Days must be a valid number", 400);
    }

    if (days < 1 || days > 365) {
      throw new AppError("Days must be between 1 and 365", 400);
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const userExpenses = await Expense.find({ userId: userId });

    // console.log("User Expenses:", userExpenses.length);

    const periodExpenses = userExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // console.log("Period Expenses:", periodExpenses.length);

    if (periodExpenses.length === 0) {
      return sendSuccess(
        res,
        {
          total: 0,
          count: 0,
          average: 0,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
        `No expenses found for last ${days} days`,
      );
    }

    const total = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = periodExpenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = { total: 0, count: 0 };
        }

        acc[expense.category].total += expense.amount;
        acc[expense.category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    const categoryArray = Object.entries(categoryBreakdown).map(
      ([category, data]) => ({
        category,
        total: Math.round(data.total * 100) / 100,
        // averageAmount: Math.round(average * 100) / 100,
        count: data.count,
        percentage: Math.round((data.total / total) * 1000) / 10,
      }),
    );

    // console.log("Category Breakdown:", categoryBreakdown);

    // categoryArray.sort((a, b) => b.total - a.total);
    sendSuccess(res, categoryArray, `Last ${days} days spending retrieved`);
  },
);

export const getMonthlyTotals = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const year = req.query.year
      ? Number(req.query.year)
      : new Date().getFullYear();

    if (isNaN(year)) {
      throw new AppError("Year must be a valid number", 400);
    }

    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      throw new AppError(
        `Year must be between 2000 and ${currentYear + 1}`,
        400,
      );
    }

    const userExpenses = await Expense.find({ userId });

    const yearExpenses = userExpenses.filter((exp) => {
      const expenseYear = new Date(exp.date).getFullYear();
      return expenseYear === year;
    });

    if (yearExpenses.length === 0) {
      sendSuccess(res, [], `No expenses found for ${year}`);
      return;
    }

    const monthlyTotals = yearExpenses.reduce(
      (acc, expense) => {
        const monthString = getMonthString(new Date(expense.date));

        if (!acc[monthString]) {
          acc[monthString] = {
            month: monthString,
            total: 0,
            count: 0,
          };
        }

        acc[monthString].total += expense.amount;
        acc[monthString].count += 1;
        return acc;
      },
      {} as Record<string, MonthlyTotals>,
    );

    const monthlyArray = Object.values(monthlyTotals);

    monthlyArray.sort((a, b) => a.month.localeCompare(b.month));

    monthlyArray.forEach((month) => {
      month.total = Math.round(month.total * 100) / 100;
    });

    sendSuccess(res, monthlyArray, `Monthly total for ${year} retrieved.`);
  },
);

export const getCurrentMonthExpenses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userExpenses = await Expense.find({ userId: userId });

    if (userExpenses.length === 0) {
      return sendSuccess(res, [], "No expenses found");
    }

    const currentMonth = getCurrentMonth();

    const currentMonthExpenses = userExpenses.filter(
      (exp) => getMonthString(new Date(exp.date)) === currentMonth,
    );

    if (currentMonthExpenses.length === 0) {
      return sendSuccess(res, [], "No expenses found for current month");
    }

    const categoryBreakdown = currentMonthExpenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = { total: 0, count: 0 };
        }

        acc[expense.category].total += expense.amount;
        acc[expense.category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    const grandTotal = Object.values(categoryBreakdown).reduce(
      (sum, cat) => sum + cat.total,
      0,
    );

    const categoryArray = Object.entries(categoryBreakdown).map(
      ([category, data]) => ({
        category,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
        percentage: Math.round((data.total / grandTotal) * 1000) / 10,
      }),
    );

    categoryArray.sort((a, b) => b.total - a.total);
    sendSuccess(
      res,
      categoryArray,
      `Current month ${currentMonth} category breakdown retrieved`,
    );
  },
);

export const getYearlyCategoryStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const currentYear = new Date().getFullYear();
    const year = req.query.year ? Number(req.query.year) : currentYear;

    if (isNaN(year)) {
      throw new AppError("Year must be a valid number", 400);
    }

    if (year < 2000 || year > currentYear + 1) {
      throw new AppError(
        `Year must be between 2000 and ${currentYear + 1}`,
        400,
      );
    }

    const userExpenses = await Expense.find({ userId });

    const yearExpenses = userExpenses.filter((exp) => {
      const expenseYear = new Date(exp.date).getFullYear();
      return expenseYear === year;
    });

    if (yearExpenses.length === 0) {
      return sendSuccess(res, [], `No expenses found for the year ${year}`);
    }

    const monthlyData: Record<
      string,
      Record<string, { total: number; count: number }>
    > = {};

    yearExpenses.forEach((expense) => {
      const monthString = getMonthString(new Date(expense.date));
      const category = expense.category;

      if (!monthlyData[monthString]) {
        monthlyData[monthString] = {};
      }

      if (!monthlyData[monthString][category]) {
        monthlyData[monthString][category] = { total: 0, count: 0 };
      }

      monthlyData[monthString][category].total += expense.amount;
      monthlyData[monthString][category].count += 1;
    });

    const result = Object.entries(monthlyData).map(([month, categories]) => {
      const categoryArray = Object.entries(categories).map(
        ([category, data]) => ({
          category,
          total: Math.round(data.total * 100) / 100,
          count: data.count,
        }),
      );

      const monthTotal = categoryArray.reduce((sum, cat) => sum + cat.total, 0);

      return {
        month,
        total: Math.round(monthTotal * 100) / 100,
        categories: categoryArray,
      };
    });

    result.sort((a, b) => a.month.localeCompare(b.month));

    sendSuccess(res, result, `Yearly category breakdown for the year ${year}`);
  },
);

export const getAllYears = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userExpenses = await Expense.find({ userId });

    if (userExpenses.length === 0) {
      return sendSuccess(res, [], "No expenses found for this user");
    }

    const yearTotals: Record<number, { total: number; count: number }> = {};

    userExpenses.forEach((expense) => {
      const year = new Date(expense.date).getFullYear();

      if (!yearTotals[year]) {
        yearTotals[year] = { total: 0, count: 0 };
      }

      yearTotals[year].total += expense.amount;
      yearTotals[year].count += 1;
    });

    const yearArray = Object.entries(yearTotals).map(([year, data]) => ({
      year: Number(year),
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }));

    yearArray.sort((a, b) => b.year - a.year);

    sendSuccess(res, yearArray, "All years spending retrieved");
  },
);
