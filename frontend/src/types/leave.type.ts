import type { EmployeeSummary } from "./employee.type";
import type { BusinessRequest, RequestStatus } from "./request.type";
import type { User } from "./user.type";

export type LeaveStatus = RequestStatus;
export type LeaveSession = "FULL" | "AM" | "PM";
export type LeaveTypeCode = "ANNUAL_LEAVE" | "UNPAID_LEAVE";

export interface LeaveType {
  id: number;
  code: LeaveTypeCode | null;
  name: string;
  description?: string | null;
  isPaid: boolean;
  annualQuota: number | string;
  deductFromBalance: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLeaveTypeRequest {
  code: LeaveTypeCode;
  name: string;
  description?: string;
  annualQuota?: number;
}

export interface UpdateLeaveTypeRequest {
  code?: LeaveTypeCode;
  name?: string;
  description?: string;
  annualQuota?: number;
  isActive?: boolean;
}

export type LeaveBalanceTransactionType =
  | "GRANT"
  | "ADJUSTMENT"
  | "DEDUCT"
  | "REFUND"
  | "CARRY_OVER"
  | "EXPIRE";

export interface LeaveBalance {
  id: number;
  employee: Pick<EmployeeSummary, "id" | "employeeCode" | "fullName" | "email">;
  leaveType: LeaveType;
  year: number;
  annualGranted: number;
  carryOverGranted: number;
  adjustment: number;
  annualUsed: number;
  carryOverUsed: number;
  carryOverExpired: number;
  remaining: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalanceTransaction {
  id: number;
  balance: LeaveBalance;
  type: LeaveBalanceTransactionType;
  amount: number | string;
  request?: { id: number; code: string } | null;
  createdBy?: Pick<User, "id" | "email"> | null;
  referenceKey?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface LeaveBalanceQuery {
  year?: number;
  leaveTypeId?: number;
}

export interface GrantLeaveBalanceRequest {
  employeeId: number;
  leaveTypeId: number;
  year: number;
  annualGranted: number;
  note?: string;
}

export interface GrantDefaultLeaveBalanceRequest {
  leaveTypeId: number;
  year: number;
  annualGranted: number;
  note?: string;
}

export interface GrantDefaultLeaveBalanceResult {
  totalEmployees: number;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
}

export interface AdjustLeaveBalanceRequest {
  amount: number;
  reason: string;
}

export interface LeaveRequest {
  id: number;
  requestId: number;
  requestCode: string;
  request: BusinessRequest;
  employee: Pick<EmployeeSummary, "id" | "employeeCode" | "fullName" | "email">;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  session: LeaveSession;
  totalDays: number | string;
  reason: string;
  attachment?: string | null;
  status: LeaveStatus;
  approvedBy?: User | null;
  approvedAt?: string | null;
  rejectReason?: string | null;
  approvalNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequest {
  employeeId?: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  session: LeaveSession;
  reason: string;
  attachment?: string;
}
