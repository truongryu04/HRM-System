import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkShift,
  deleteWorkShift,
  getWorkShifts,
  updateWorkShift,
} from "../services/work-shift.api";
import type { WorkShiftRequest } from "../types/work-shift.type";

export const useWorkShifts = () =>
  useQuery({ queryKey: ["work-shifts"], queryFn: getWorkShifts });

export const useCreateWorkShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkShift,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["work-shifts"] }),
  });
};

export const useUpdateWorkShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WorkShiftRequest }) =>
      updateWorkShift(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["work-shifts"] }),
  });
};

export const useDeleteWorkShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkShift,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["work-shifts"] }),
  });
};
