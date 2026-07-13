import { apiClient } from "./api-client";
import type {
  CreateLeaveRequest,
  LeaveRequest,
  LeaveType,
} from "@/types/leave.type";

export const getLeaveRequests = async () => {
  const { data } = await apiClient.get("/leave-requests/my");

  return data as LeaveRequest[];
};

export const getLeaveRequestByRequestId = async (requestId: number) => {
  const { data } = await apiClient.get(`/leave-requests/by-request/${requestId}`);

  return data as LeaveRequest;
};

export const createLeaveRequest = async (payload: CreateLeaveRequest) => {
  const { data } = await apiClient.post("/leave-requests", payload);

  return data as LeaveRequest;
};

export const cancelRequest = async (requestId: number) => {
  const { data } = await apiClient.patch(`/requests/${requestId}/cancel`);

  return data as LeaveRequest;
};

export const getLeaveTypes = async () => {
  const { data } = await apiClient.get("/leave-types");

  return data as LeaveType[];
};
