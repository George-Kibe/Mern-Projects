import {
  AuthResponse,
  ExportData,
  LoginRequest,
  SignupRequest,
} from "@/types/auth.types";
import api from "./api";
import { ApiResponse, User } from "@/types";
import { Avatar } from "@/types/auth.types";

export const signup = async (data: SignupRequest) => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/signup",
    data,
  );

  return response.data;
};

export const login = async (data: LoginRequest) => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    data,
  );

  return response.data;
};

export const getProfile = async () => {
  const response = await api.get<ApiResponse<User>>("/profile");

  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
  email?: string;
  password?: string;
}) => {
  const response = await api.put<ApiResponse<User>>("/profile", data);

  return response.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post<ApiResponse<Avatar>>(
    "/profile/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const deleteAvatar = async () => {
  const response = await api.delete<ApiResponse<null>>("/profile/avatar");

  return response.data;
};

export const exportData = async () => {
  const response = await api.get<ApiResponse<ExportData>>("/profile/export");

  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete<ApiResponse<null>>("/profile/account");

  return response.data;
};
