import { useQuery } from "@tanstack/react-query";

import { getPendingApprovalRequests } from "../services/request.api";
import type { BusinessRequest } from "@/types/leave.type";

export const approvalRequestKeys = {
  all: ["approval-requests"] as const,
  pending: () => [...approvalRequestKeys.all, "pending"] as const,
};

export const usePendingApprovalRequests = () => {
  return useQuery<BusinessRequest[]>({
    queryKey: approvalRequestKeys.pending(),
    queryFn: getPendingApprovalRequests,
  });
};
