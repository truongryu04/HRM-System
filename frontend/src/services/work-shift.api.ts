import type { WorkShift, WorkShiftRequest } from "../types/work-shift.type";
import { apiClient } from "./api-client";

export const getWorkShifts = async () => {
  const { data } = await apiClient.get<WorkShift[]>("/work-shifts");
  return data;
};

export const createWorkShift = async (payload: WorkShiftRequest) => {
  const { data } = await apiClient.post<WorkShift>("/work-shifts", payload);
  return data;
};

export const updateWorkShift = async (
  id: number,
  payload: WorkShiftRequest,
) => {
  const { data } = await apiClient.patch<WorkShift>(
    `/work-shifts/${id}`,
    payload,
  );
  return data;
};

export const deleteWorkShift = async (id: number) => {
  const { data } = await apiClient.delete(`/work-shifts/${id}`);
  return data;
};
