import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApprovalFlow,
  createApprovalFlowStepFromTemplate,
  createApprovalStepTemplate,
  deleteApprovalFlow,
  deleteApprovalFlowStep,
  deleteApprovalStepTemplate,
  getApprovalFlowsWithStepCounts,
  getApprovalFlowSteps,
  getApprovalStepTemplates,
  getRequestTypes,
  updateApprovalFlow,
  updateApprovalFlowStep,
  updateApprovalStepTemplate,
} from "../services/request-config.api";
import type {
  CreateApprovalFlowRequest,
  CreateApprovalFlowStepFromTemplateRequest,
  CreateApprovalStepTemplateRequest,
  UpdateApprovalFlowStepFromTemplateRequest,
  UpdateApprovalFlowRequest,
  UpdateApprovalStepTemplateRequest,
} from "@/types/request-config.type";

export const requestConfigKeys = {
  all: ["request-config"] as const,
  requestTypes: () => [...requestConfigKeys.all, "request-types"] as const,
  flows: (requestTypeId?: number) =>
    [...requestConfigKeys.all, "approval-flows", requestTypeId ?? "all"] as const,
  steps: (flowId?: number) =>
    [...requestConfigKeys.all, "approval-flow-steps", flowId ?? "none"] as const,
  stepTemplates: () =>
    [...requestConfigKeys.all, "approval-step-templates"] as const,
};

export const useRequestTypes = () => {
  return useQuery({
    queryKey: requestConfigKeys.requestTypes(),
    queryFn: getRequestTypes,
  });
};

export const useApprovalFlows = (requestTypeId?: number) => {
  return useQuery({
    queryKey: requestConfigKeys.flows(requestTypeId),
    queryFn: () => getApprovalFlowsWithStepCounts(requestTypeId),
  });
};

export const useApprovalFlowSteps = (flowId?: number) => {
  return useQuery({
    queryKey: requestConfigKeys.steps(flowId),
    queryFn: () => getApprovalFlowSteps(flowId!),
    enabled: Boolean(flowId),
  });
};

export const useApprovalStepTemplates = () => {
  return useQuery({
    queryKey: requestConfigKeys.stepTemplates(),
    queryFn: getApprovalStepTemplates,
  });
};

export const useCreateApprovalFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApprovalFlowRequest) =>
      createApprovalFlow(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useUpdateApprovalFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateApprovalFlowRequest;
    }) => updateApprovalFlow(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useDeleteApprovalFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApprovalFlow,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useCreateApprovalFlowStepFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flowId,
      payload,
    }: {
      flowId: number;
      payload: CreateApprovalFlowStepFromTemplateRequest;
    }) => createApprovalFlowStepFromTemplate(flowId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useUpdateApprovalFlowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateApprovalFlowStepFromTemplateRequest;
    }) => updateApprovalFlowStep(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useDeleteApprovalFlowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApprovalFlowStep,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useCreateApprovalStepTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApprovalStepTemplateRequest) =>
      createApprovalStepTemplate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useUpdateApprovalStepTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateApprovalStepTemplateRequest;
    }) => updateApprovalStepTemplate(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};

export const useDeleteApprovalStepTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApprovalStepTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestConfigKeys.all });
    },
  });
};
