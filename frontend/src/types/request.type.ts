import type { EmployeeSummary } from "./employee.type";
import type { LeaveType } from "./leave.type";
import type { User } from "./user.type";

export type RequestStatus =
  | "pending"
  | "confirmed"
  | "approved"
  | "rejected"
  | "canceled";

export type ApproverType =
  | "DIRECT_MANAGER"
  | "ROLE"
  | "POSITION"
  | "SPECIFIC_USER";

export type RequestApprovalStatus =
  | "WAITING"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SKIPPED";

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

export interface BusinessRequest {
  id: number;
  code: string;
  requestType: RequestType;
  employee: Pick<
    EmployeeSummary,
    "id" | "employeeCode" | "fullName" | "email" | "department" | "position"
  >;
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

export interface RequestApproval {
  id: number;
  stepOrder: number;
  stepName: string;
  approverType: ApproverType;
  roleCode?: string | null;
  positionCode?: string | null;
  specificUser?: User | null;
  status: RequestApprovalStatus;
  actedBy?: User | null;
  actedAt?: string | null;
  note?: string | null;
}

export interface RequestHistory {
  id: number;
  action: string;
  note?: string | null;
  metadata?: Record<string, unknown> | null;
  actor?: User | null;
  createdAt: string;
}

export interface LeaveRequestPayload {
  id: number;
  leaveType?: LeaveType | null;
  startDate: string;
  endDate: string;
  totalDays: number | string;
  reason: string;
  attachment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RequestPayload = LeaveRequestPayload | Record<string, unknown> | null;

export interface BusinessRequestDetail {
  request: BusinessRequest;
  approvals: RequestApproval[];
  histories: RequestHistory[];
}

export interface ApproveRequestPayload {
  note?: string;
}

export interface RejectRequestPayload {
  reason: string;
}

export type ApprovalQueueTab = "pending" | "recently-handled";
