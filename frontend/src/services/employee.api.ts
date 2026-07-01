import { apiClient } from "./api-client";
import type { EmployeeListResponse } from "@/types/employee.type";

export const getEmployees = async (params?: { page?: number; limit?: number }) => {
  const { data } = await apiClient.get("/employees", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 1000,
    },
  });

  return data as EmployeeListResponse;
};