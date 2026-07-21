import { apiClient } from "./api-client";
import type {
  AdjustLeaveBalanceRequest,
  GrantLeaveBalanceRequest,
  GrantDefaultLeaveBalanceRequest,
  GrantDefaultLeaveBalanceResult,
  LeaveBalance,
  LeaveBalanceQuery,
  LeaveBalanceTransaction,
} from "@/types/leave.type";

export const getMyLeaveBalances = async (params: LeaveBalanceQuery) => {
  const { data } = await apiClient.get("/leave-balances/my", { params });
  return data as LeaveBalance[];
};

export const getEmployeeLeaveBalances = async (
  employeeId: number,
  params: LeaveBalanceQuery,
) => {
  const { data } = await apiClient.get(`/leave-balances/employee/${employeeId}`, {
    params,
  });
  return data as LeaveBalance[];
};

export const getEmployeeLeaveBalanceHistory = async (
  employeeId: number,
  params: LeaveBalanceQuery,
) => {
  const { data } = await apiClient.get(
    `/leave-balances/employee/${employeeId}/history`,
    { params },
  );
  return data as LeaveBalanceTransaction[];
};

export const grantLeaveBalance = async (payload: GrantLeaveBalanceRequest) => {
  const { data } = await apiClient.post("/leave-balances/grant", payload);
  return data as LeaveBalance;
};

export const grantDefaultLeaveBalance = async (
  payload: GrantDefaultLeaveBalanceRequest,
) => {
  const { data } = await apiClient.post("/leave-balances/grant-default", payload);
  return data as GrantDefaultLeaveBalanceResult;
};

export const adjustLeaveBalance = async (
  id: number,
  payload: AdjustLeaveBalanceRequest,
) => {
  const { data } = await apiClient.patch(`/leave-balances/${id}/adjust`, payload);
  return data as LeaveBalance;
};
