import { apiClient } from "./api-client";
import type { UserListResponse } from "@/types/user.type";
import type { CreateUserRequest } from "@/types/user.type";
interface UserQuery {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
  linkedEmployee?: string;
}

export const getUsers = async (params: UserQuery) => {
  const { data } = await apiClient.get("/users", {
    params,
  });

  return data as UserListResponse;
};

export const createUser = async (payload: CreateUserRequest) => {
  const { data } = await apiClient.post("/users", payload);

  return data;
};
