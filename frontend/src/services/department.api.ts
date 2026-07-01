import { apiClient } from "./api-client";
import type { Department, DepartmentRequest } from "@/types/department.type";

export const getDepartments = async () => {
  const { data } = await apiClient.get("/departments");

  return data as Department[];
};

export const createDepartment = async (payload: DepartmentRequest) => {
  const { data } = await apiClient.post("/departments", payload);

  return data as Department;
};

export const updateDepartment = async (
  id: number,
  payload: DepartmentRequest,
) => {
  const { data } = await apiClient.put(`/departments/${id}`, payload);

  return data as Department;
};

export const deleteDepartment = async (id: number) => {
  const { data } = await apiClient.delete(`/departments/${id}`);

  return data;
};