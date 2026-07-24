import { apiClient } from "./api-client";
import type { Permission } from "../types/permission.type";

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await apiClient.get("/permissions");

  return response.data;
};

export const updatePermission = async (
  id: string,
  data: { name: string },
): Promise<Permission> => {
  const response = await apiClient.put(`/permissions/${id}`, data);

  return response.data;
};
