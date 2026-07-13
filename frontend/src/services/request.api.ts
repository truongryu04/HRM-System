import { apiClient } from "./api-client";
import type {
  ApproveRequestPayload,
  BusinessRequest,
  BusinessRequestDetail,
  RejectRequestPayload,
} from "@/types/request.type";

export const getPendingApprovalRequests = async () => {
  const { data } = await apiClient.get("/requests/approval");

  return data as BusinessRequest[];
};

export const getRequestDetail = async (id: number) => {
  const { data } = await apiClient.get(`/requests/${id}`);

  return data as BusinessRequestDetail;
};

export const approveRequest = async ({
  id,
  payload,
}: {
  id: number;
  payload: ApproveRequestPayload;
}) => {
  const { data } = await apiClient.patch(`/requests/${id}/approve`, payload);

  return data as BusinessRequest;
};

export const rejectRequest = async ({
  id,
  payload,
}: {
  id: number;
  payload: RejectRequestPayload;
}) => {
  const { data } = await apiClient.patch(`/requests/${id}/reject`, payload);

  return data as BusinessRequest;
};
