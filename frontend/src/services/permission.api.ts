import { apiClient } from "./api-client";
import type { Permission } from "../types/permission.type";

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await apiClient.get("/permissions");

  return response.data;
};
