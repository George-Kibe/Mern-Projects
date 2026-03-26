import { ApiResponse, Expense } from "@/types";
import api from "./api";

export const createExpense = async (data: {
  amount: number;
  description: string;
  category: string;
  date: string;
}) => {
  const response = await api.post<ApiResponse<Expense>>("/expenses", data);

  return response.data;
};

export const getAllExpenses = async (endPoint: string) => {
  const response = await api.get<ApiResponse<Expense[]>>(endPoint);

  return response.data;
};

export const updateExpense = async (
  id: string,
  data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  },
) => {
  const response = await api.post<ApiResponse<Expense>>(
    `/expenses/${id}`,
    data,
  );
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete<ApiResponse<Expense>>(`/expenses/${id}`);
  return response.data;
};
