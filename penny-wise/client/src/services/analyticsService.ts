import { ApiResponse } from "@/types";
import {
  AllYears,
  CategoryTotal,
  DashboardStats,
  MonthlyTotal,
  SpendingTrend,
  YearlyCategoryStats,
} from "@/types/analytics.types";
import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get<ApiResponse<DashboardStats>>(
    "/analytics/dashboard",
  );
  return response.data;
};

export const getCategoryStats = async () => {
  const response = await api.get<ApiResponse<CategoryTotal[]>>(
    "/analytics/category",
  );
  return response.data;
};

export const getTrends = async () => {
  const response =
    await api.get<ApiResponse<SpendingTrend[]>>("/analytics/trends");
  return response.data;
};

export const getPeriodStats = async (days: number) => {
  const response = await api.get<ApiResponse<CategoryTotal[]>>(
    `/analytics/period?days=${days}`,
  );
  return response.data;
};

export const getYearlyStats = async (year: number) => {
  const response = await api.get<ApiResponse<MonthlyTotal[]>>(
    `/analytics/monthly?year=${year}`,
  );
  return response.data;
};

export const getCurrentMonth = async () => {
  const response = await api.get<ApiResponse<CategoryTotal[]>>(
    "/analytics/current-month",
  );

  return response.data;
};

export const getYearlyCategoryStats = async (year: number) => {
  const response = await api.get<ApiResponse<YearlyCategoryStats[]>>(
    `/analytics/yearly-categories?year=${year}`,
  );

  return response.data;
};

export const getAllYears = async () => {
  const response = await api.get<ApiResponse<AllYears[]>>(
    "/analytics/all-years",
  );

  return response.data;
};
