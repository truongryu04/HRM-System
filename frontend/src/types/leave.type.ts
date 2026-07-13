import type { EmployeeSummary } from "./employee.type";
import type { User } from "./user.type";

export type RequestStatus =
  | "pending"
  | "confirmed"
  | "approved"
  | "rejected"
  | "canceled";

export type LeaveStatus = RequestStatus;

export interface RequestType {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  handlerKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string | null;
  isPaid: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessRequest {
  id: number;
  code: string;
  requestType: RequestType;
  employee: Pick<EmployeeSummary, "id" | "employeeCode" | "fullName" | "email">;
  createdBy: User;
  title: string;
  status: RequestStatus;
  currentStepOrder: number;
  finalApprovedBy?: User | null;
  finalApprovedAt?: string | null;
  rejectedBy?: User | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
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
  reason: string;
  attachment?: string;
}
