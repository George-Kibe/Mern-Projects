import { Router } from "express";
import {
  getAllYears,
  getCurrentMonthExpenses,
  getDashboardStats,
  getExpensesByCategories,
  getMonthlyTotals,
  getPeriodStats,
  getSpendingTrends,
  getYearlyCategoryStats,
} from "../controllers/analyticsControllers";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/category", requireAuth, getExpensesByCategories);
router.get("/monthly", requireAuth, getMonthlyTotals);
router.get("/dashboard", requireAuth, getDashboardStats);
router.get("/trends", requireAuth, getSpendingTrends);
router.get("/period", requireAuth, getPeriodStats);
router.get("/current-month", requireAuth, getCurrentMonthExpenses);
router.get("/yearly-categories", requireAuth, getYearlyCategoryStats);
router.get("/all-years", requireAuth, getAllYears);

export default router;
