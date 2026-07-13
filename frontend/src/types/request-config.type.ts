import type { RequestType } from "./request.type";
import type { User } from "./user.type";

export type ApproverType =
  | "DIRECT_MANAGER"
  | "ROLE"
  | "POSITION"
  | "SPECIFIC_USER";

export interface ApprovalFlow {
  id: number;
  requestType: RequestType;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalFlowWithStepCount extends ApprovalFlow {
  stepCount: number;
}

export interface ApprovalFlowStep {
  id: number;
  flow: ApprovalFlow;
  approvalStepTemplate?: ApprovalStepTemplate | null;
  stepOrder: number;
  stepName: string;
  approverType: ApproverType;
  roleCode?: string | null;
  positionCode?: string | null;
  specificUser?: User | null;
  condition?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStepTemplate {
  id: number;
  stepName: string;
  approverType: ApproverType;
  roleCode?: string | null;
  positionCode?: string | null;
  specificUser?: User | null;
  condition?: Record<string, unknown> | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApprovalFlowRequest {
  requestTypeId: number;
  name: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export type UpdateApprovalFlowRequest = Partial<CreateApprovalFlowRequest>;

export interface CreateApprovalFlowStepRequest {
  stepOrder: number;
  stepName: string;
  approverType: ApproverType;
  roleCode?: string;
  positionCode?: string;
  specificUserId?: number;
  condition?: Record<string, unknown>;
}

export type CreateApprovalStepTemplateRequest = Omit<
  CreateApprovalFlowStepRequest,
  "stepOrder"
>;

export type UpdateApprovalStepTemplateRequest =
  Partial<CreateApprovalStepTemplateRequest>;

export interface CreateApprovalFlowStepFromTemplateRequest {
  templateId: number;
  stepOrder?: number;
}

export type UpdateApprovalFlowStepFromTemplateRequest =
  CreateApprovalFlowStepFromTemplateRequest;
