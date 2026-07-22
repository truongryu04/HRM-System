import { useQuery } from "@tanstack/react-query";

import {
  getEmployeeLeaveBalanceHistory,
  getEmployeeLeaveBalances,
  getGrantedEmployeeIds,
  getMyLeaveBalances,
} from "../services/leave-balance.api";
import type { LeaveBalanceQuery } from "@/types/leave.type";

export const leaveBalanceKeys = {
  all: ["leave-balances"] as const,
  my: (query: LeaveBalanceQuery) =>
    [...leaveBalanceKeys.all, "my", query] as const,
  employee: (employeeId: number | null, query: LeaveBalanceQuery) =>
    [...leaveBalanceKeys.all, "employee", employeeId, query] as const,
  employeeHistory: (employeeId: number | null, query: LeaveBalanceQuery) =>
    [...leaveBalanceKeys.all, "employee-history", employeeId, query] as const,
  grantedEmployeeIds: (year: number, leaveTypeId: number | null) =>
    [
      ...leaveBalanceKeys.all,
      "granted-employee-ids",
      year,
      leaveTypeId,
    ] as const,
};

export function useMyLeaveBalances(query: LeaveBalanceQuery) {
  return useQuery({
    queryKey: leaveBalanceKeys.my(query),
    queryFn: () => getMyLeaveBalances(query),
  });
}

export function useEmployeeLeaveBalances(
  employeeId: number | null,
  query: LeaveBalanceQuery,
) {
  return useQuery({
    queryKey: leaveBalanceKeys.employee(employeeId, query),
    queryFn: () => getEmployeeLeaveBalances(employeeId!, query),
    enabled: employeeId !== null,
  });
}

export function useEmployeeLeaveBalanceHistory(
  employeeId: number | null,
  query: LeaveBalanceQuery,
) {
  return useQuery({
    queryKey: leaveBalanceKeys.employeeHistory(employeeId, query),
    queryFn: () => getEmployeeLeaveBalanceHistory(employeeId!, query),
    enabled: employeeId !== null,
  });
}

export function useGrantedEmployeeIds(
  year: number,
  leaveTypeId: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: leaveBalanceKeys.grantedEmployeeIds(year, leaveTypeId),
    queryFn: () => getGrantedEmployeeIds({ year, leaveTypeId: leaveTypeId! }),
    enabled: enabled && leaveTypeId !== null,
  });
}
