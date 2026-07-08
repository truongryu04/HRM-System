import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelRequest,
  createLeaveRequest,
  getLeaveRequests,
  getLeaveTypes,
} from "../services/leave.api";
import type { CreateLeaveRequest, LeaveRequest } from "@/types/leave.type";

export const leaveRequestKeys = {
  all: ["leave-requests"] as const,
  list: () => [...leaveRequestKeys.all, "list"] as const,
  types: () => [...leaveRequestKeys.all, "types"] as const,
};

export const useLeaveRequests = () => {
  return useQuery<LeaveRequest[]>({
    queryKey: leaveRequestKeys.list(),
    queryFn: getLeaveRequests,
  });
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: leaveRequestKeys.types(),
    queryFn: getLeaveTypes,
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLeaveRequest) => createLeaveRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leaveRequestKeys.all,
      });
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leaveRequestKeys.all,
      });
    },
  });
};
