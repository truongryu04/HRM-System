import { apiClient } from "./api-client";
import type {
  CreateLeaveTypeRequest,
  CreateLeaveRequest,
  LeaveRequest,
  LeaveType,
  UpdateLeaveTypeRequest,
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

export const createLeaveType = async (payload: CreateLeaveTypeRequest) => {
  const { data } = await apiClient.post("/leave-types", payload);
  return data as LeaveType;
};

export const updateLeaveType = async (
  id: number,
  payload: UpdateLeaveTypeRequest,
) => {
  const { data } = await apiClient.patch(`/leave-types/${id}`, payload);
  return data as LeaveType;
};

export const deactivateLeaveType = async (id: number) => {
  const { data } = await apiClient.delete(`/leave-types/${id}`);
  return data as { message: string };
};
