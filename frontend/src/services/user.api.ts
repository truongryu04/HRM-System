import { apiClient } from "./api-client";
import type {
  BulkPasswordResetResponse,
  UpdateUserRequest,
  UserListResponse,
} from "@/types/user.type";
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

export const updateUser = async (id: number, payload: UpdateUserRequest) => {
  const { data } = await apiClient.patch(`/users/${id}`, payload);

  return data;
};

export const resetUserPasswords = async (userIds: number[]) => {
  const { data } = await apiClient.post<BulkPasswordResetResponse>(
    "/users/bulk-password-reset",
    { userIds },
  );

  return data;
};
