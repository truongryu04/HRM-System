import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveRequest,
  getPendingApprovalRequests,
  getRequestDetail,
  rejectRequest,
} from "../services/request.api";
import type { BusinessRequest, BusinessRequestDetail } from "@/types/request.type";

export const approvalRequestKeys = {
  all: ["approval-requests"] as const,
  pending: () => [...approvalRequestKeys.all, "pending"] as const,
  detail: (id: number) => [...approvalRequestKeys.all, "detail", id] as const,
};

export const usePendingApprovalRequests = () => {
  return useQuery<BusinessRequest[]>({
    queryKey: approvalRequestKeys.pending(),
    queryFn: getPendingApprovalRequests,
  });
};

export const useRequestDetail = (id?: number) => {
  return useQuery<BusinessRequestDetail>({
    queryKey: approvalRequestKeys.detail(id ?? 0),
    queryFn: () => getRequestDetail(id as number),
    enabled: Boolean(id),
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRequest,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: approvalRequestKeys.all });
      await queryClient.invalidateQueries({
        queryKey: approvalRequestKeys.detail(variables.id),
      });
    },
  });
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectRequest,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: approvalRequestKeys.all });
      await queryClient.invalidateQueries({
        queryKey: approvalRequestKeys.detail(variables.id),
      });
    },
  });
};
