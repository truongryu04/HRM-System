// hooks/useUsers.ts

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services/user.api";
import type { UserListResponse } from "@/types/user.type";
interface UserQuery {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
  linkedEmployee?: string;
}
export const useUsers = (params: UserQuery) => {
  return useQuery<UserListResponse>({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};
