import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser } from "../services/user.api";
import type { UpdateUserRequest, UserListResponse } from "@/types/user.type";
import { toast } from "sonner";
import { AxiosError } from "axios";
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
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateUserRequest;
    }) => {
      const result = await updateUser(id, payload);
      return result;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("Cập nhật tài khoản thành công");
    },

    onError: (error) => {
      console.error(error);

      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ?? "Cập nhật tài khoản thất bại",
        );
        return;
      }

      toast.error("Cập nhật tài khoản thất bại");
    },
  });
};
