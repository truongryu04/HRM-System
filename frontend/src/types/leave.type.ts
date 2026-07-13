import type { EmployeeSummary } from "./employee.type";
import type { BusinessRequest, RequestStatus } from "./request.type";
import type { User } from "./user.type";

export type LeaveStatus = RequestStatus;

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
