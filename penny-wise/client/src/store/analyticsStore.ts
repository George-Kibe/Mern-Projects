import { AnalyticsState, MonthlyTotal } from "@/types/analytics.types";
import { create } from "zustand";
import {
  getDashboardStats as getDashboardStatsService,
  getYearlyStats as getYearlyStatsService,
  getCategoryStats as getCategoryStatsService,
  getTrends as getTrendsService,
  getPeriodStats as getPeriodStatsService,
  getCurrentMonth as getCurrentMonthService,
  getYearlyCategoryStats as getYearlyCategoryStatsService,
  getAllYears as getAllYearsService,
} from "@/services/analyticsService";
import { AxiosError } from "axios";

interface AnalyticsStore extends AnalyticsState {
  getDashboardStats: () => Promise<void>;
  getCategoryStats: () => Promise<void>;
  getTrends: () => Promise<void>;
  getPeriodStats: (days: number) => Promise<void>;
  getYearlyStats: (year: number) => Promise<void>;

  getCurrentMonth: () => Promise<void>;
  getYearlyCategoryStats: (year: number) => Promise<void>;
  getAllYears: () => Promise<void>;

  loadAllAnalytics: () => Promise<void>;
  setSelectedYear: (year: number) => void;

  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  dashboardStats: null,
  categoryData: [],

  trends: [],
  periodData: [],

  currentMonthData: [],
  yearlyCategoryData: {},
  allYearsData: [],
  availableYears: [],
  selectedYear: null,

  yearlyData: {},

  isLoading: false,
  error: null,

  getDashboardStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getDashboardStatsService();

      // console.log(response.data);

      if (response.data) {
        set({
          dashboardStats: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  getCategoryStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getCategoryStatsService();

      if (response.data) {
        set({
          categoryData: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  getTrends: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getTrendsService();

      if (response.data) {
        set({
          trends: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  getPeriodStats: async (days: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getPeriodStatsService(days);

      // console.log("Res.Data-Period:", response.data);

      if (response.data) {
        set({
          periodData: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  getYearlyStats: async (year: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getYearlyStatsService(year);

      if (response.data) {
        set((state) => ({
          yearlyData: {
            ...state.yearlyData,
            [year.toString()]: response.data,
          } as { [year: string]: MonthlyTotal[] },

          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  getCurrentMonth: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getCurrentMonthService();

      if (response.data) {
        set({
          currentMonthData: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  getYearlyCategoryStats: async (year: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getYearlyCategoryStatsService(year);

      const currentYearlyCategoryData = get().yearlyCategoryData;

      if (response.data) {
        set({
          yearlyCategoryData: {
            ...currentYearlyCategoryData,
            [year.toString()]: response.data,
          },
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  getAllYears: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getAllYearsService();

      if (response.data) {
        const years = response.data.map((item) => item.year);
        const mostRecentYear = years[0];

        set({
          allYearsData: response.data,
          availableYears: years,
          selectedYear: mostRecentYear,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  loadAllAnalytics: async () => {
    set({ isLoading: true, error: null });

    try {
      await Promise.all([
        get().getDashboardStats(),
        get().getCategoryStats(),
        get().getTrends(),
        get().getCurrentMonth(),
        get().getAllYears(),
      ]);

      // const { availableYears } = get();

      // await Promise.all(
      //   availableYears.flatMap((year) => [
      //     get().getYearlyStats(year),
      //     get().getYearlyCategoryStats(year),
      //   ]),
      // );

      set({ isLoading: false, error: null });
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      set({
        error: err.response?.data?.error,
        isLoading: false,
      });
    }
  },

  setSelectedYear: (year: number) => {
    set({ selectedYear: year });
  },
}));
