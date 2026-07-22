import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelRequest,
  createLeaveRequest,
  getLeaveRequestByRequestId,
  getLeaveRequests,
  getLeaveTypes,
} from "../services/leave.api";
import type { CreateLeaveRequest, LeaveRequest } from "@/types/leave.type";

export const leaveRequestKeys = {
  all: ["leave-requests"] as const,
  list: () => [...leaveRequestKeys.all, "list"] as const,
  byRequestId: (requestId: number) =>
    [...leaveRequestKeys.all, "by-request", requestId] as const,
  types: () => [...leaveRequestKeys.all, "types"] as const,
};

export const useLeaveRequests = () => {
  return useQuery<LeaveRequest[]>({
    queryKey: leaveRequestKeys.list(),
    queryFn: getLeaveRequests,
  });
};

export const useLeaveTypes = (enabled = true) => {
  return useQuery({
    queryKey: leaveRequestKeys.types(),
    queryFn: getLeaveTypes,
    enabled,
  });
};

export const useLeaveRequestByRequestId = (
  requestId?: number,
  enabled = true,
) => {
  return useQuery<LeaveRequest>({
    queryKey: leaveRequestKeys.byRequestId(requestId ?? 0),
    queryFn: () => getLeaveRequestByRequestId(requestId as number),
    enabled: Boolean(requestId) && enabled,
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
