import { apiClient } from "./api-client";
import { useAuthStore } from "../store/auth.store";
import type { CurrentSession } from "../types/auth.type";

export const login = async (email: string, password: string) => {
  const response = await apiClient.post("/auth/login", { email, password });

  return response.data;
};

export const activateAccount = async (payload: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await apiClient.post("/auth/activate-account", payload);

  return response.data;
};

export const resetPassword = async (payload: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await apiClient.post("/auth/reset-password", payload);

  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await apiClient.post("/auth/forgot-password", { email });

  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post("/auth/logout", {
    refreshToken: useAuthStore.getState().refreshToken,
  });
  return response.data;
};
export const getCurrentUser = async (): Promise<CurrentSession> => {
  const response = await apiClient.get("/auth/me");
  return response.data.data as CurrentSession;
};
