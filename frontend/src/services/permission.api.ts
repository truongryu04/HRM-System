import { apiClient } from "./api-client";

export const getPermissions = async () => {
  const response = await apiClient.get("/permissions");

  return response.data;
};
