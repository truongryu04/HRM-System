import { apiClient } from "./api-client";
import type { BusinessRequest } from "@/types/leave.type";

export const getPendingApprovalRequests = async () => {
  const { data } = await apiClient.get("/requests/pending-approval");

  return data as BusinessRequest[];
};
