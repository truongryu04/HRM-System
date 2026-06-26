import { apiClient } from "./api-client";

export const getRoles = async () => {
  const response = await apiClient.get("/roles");

  return response.data;
};
