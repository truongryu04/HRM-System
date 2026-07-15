import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { queryClient } from "../app/query-client";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_URL environment variable.");
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }

    return Promise.reject(error);
  },
);
