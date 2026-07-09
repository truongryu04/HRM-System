import { apiClient } from "./api-client";
import type { RequestType } from "@/types/leave.type";
import type {
  ApprovalFlow,
  ApprovalFlowStep,
  ApprovalFlowWithStepCount,
  ApprovalStepTemplate,
  CreateApprovalFlowRequest,
  CreateApprovalFlowStepFromTemplateRequest,
  CreateApprovalStepTemplateRequest,
  UpdateApprovalFlowStepFromTemplateRequest,
  UpdateApprovalFlowRequest,
  UpdateApprovalStepTemplateRequest,
} from "@/types/request-config.type";

export const getRequestTypes = async () => {
  const { data } = await apiClient.get("/request-types");

  return data as RequestType[];
};

export const getApprovalFlows = async (requestTypeId?: number) => {
  const { data } = await apiClient.get("/approval-flows", {
    params: requestTypeId ? { requestTypeId } : undefined,
  });

  return data as ApprovalFlow[];
};

export const getApprovalFlowsWithStepCounts = async (
  requestTypeId?: number,
) => {
  const flows = await getApprovalFlows(requestTypeId);

  return Promise.all(
    flows.map(async (flow): Promise<ApprovalFlowWithStepCount> => {
      const steps = await getApprovalFlowSteps(flow.id);

      return {
        ...flow,
        stepCount: steps.length,
      };
    }),
  );
};

export const createApprovalFlow = async (
  payload: CreateApprovalFlowRequest,
) => {
  const { data } = await apiClient.post("/approval-flows", payload);

  return data as ApprovalFlow;
};

export const updateApprovalFlow = async (
  id: number,
  payload: UpdateApprovalFlowRequest,
) => {
  const { data } = await apiClient.patch(`/approval-flows/${id}`, payload);

  return data as ApprovalFlow;
};

export const deleteApprovalFlow = async (id: number) => {
  const { data } = await apiClient.delete(`/approval-flows/${id}`);

  return data as { message: string };
};

export const getApprovalFlowSteps = async (flowId: number) => {
  const { data } = await apiClient.get(`/approval-flow-steps/flow/${flowId}`);

  return data as ApprovalFlowStep[];
};

export const createApprovalFlowStepFromTemplate = async (
  flowId: number,
  payload: CreateApprovalFlowStepFromTemplateRequest,
) => {
  const { data } = await apiClient.post(
    `/approval-flow-steps/flow/${flowId}/from-template`,
    payload,
  );

  return data as ApprovalFlowStep;
};

export const updateApprovalFlowStep = async (
  id: number,
  payload: UpdateApprovalFlowStepFromTemplateRequest,
) => {
  const { data } = await apiClient.patch(
    `/approval-flow-steps/${id}/from-template`,
    payload,
  );

  return data as ApprovalFlowStep;
};

export const deleteApprovalFlowStep = async (id: number) => {
  const { data } = await apiClient.delete(`/approval-flow-steps/${id}`);

  return data as { message: string };
};

export const getApprovalStepTemplates = async () => {
  const { data } = await apiClient.get("/approval-step-templates");

  return data as ApprovalStepTemplate[];
};

export const createApprovalStepTemplate = async (
  payload: CreateApprovalStepTemplateRequest,
) => {
  const { data } = await apiClient.post("/approval-step-templates", payload);

  return data as ApprovalStepTemplate;
};

export const updateApprovalStepTemplate = async (
  id: number,
  payload: UpdateApprovalStepTemplateRequest,
) => {
  const { data } = await apiClient.patch(
    `/approval-step-templates/${id}`,
    payload,
  );

  return data as ApprovalStepTemplate;
};

export const deleteApprovalStepTemplate = async (id: number) => {
  const { data } = await apiClient.delete(`/approval-step-templates/${id}`);

  return data as { message: string };
};
