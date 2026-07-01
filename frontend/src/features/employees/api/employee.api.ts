import { apiClient } from "./api-client";
import type {
  EmployeeCreateRequest,
  EmployeeListResponse,
  EmployeeStatus,
  EmployeeSummary,
  EmployeeUpdateRequest,
} from "@/features/employees/types/employee.type";

export const getEmployees = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const { data } = await apiClient.get("/employees", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 1000,
    },
  });

  return data as EmployeeListResponse;
};

export const getEmployee = async (id: number) => {
  const { data } = await apiClient.get(`/employees/${id}`);

  return data as EmployeeSummary;
};

export const createEmployee = async (payload: EmployeeCreateRequest) => {
  const { data } = await apiClient.post("/employees", payload);

  return data as EmployeeSummary;
};

export const updateEmployee = async (
  id: number,
  payload: EmployeeUpdateRequest,
) => {
  const { data } = await apiClient.put(`/employees/${id}`, payload);

  return data as EmployeeSummary;
};

export const deleteEmployee = async (id: number) => {
  const { data } = await apiClient.delete(`/employees/${id}`);

  return data as { message: string };
};
export const updateEmployeeStatus = async (
  id: number,
  status: EmployeeStatus,
) => {
  const { data } = await apiClient.patch(`/employees/${id}/status`, { status });

  return data as EmployeeSummary;
};
