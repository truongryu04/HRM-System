import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { attendanceApi } from "../services/attendance.api";
import type { UpdateAttendanceRequest } from "@/types/attendance.type";

export const attendanceKeys = {
  all: ["attendance"] as const,

  dashboard: () => [...attendanceKeys.all, "dashboard"] as const,

  list: (params?: unknown) => [...attendanceKeys.all, "list", params] as const,
};

export function useAttendanceDashboard(enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.dashboard(),
    queryFn: attendanceApi.getDashboard,
    enabled,
  });
}

export function useAttendances(params?: {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
  departmentId?: number;
  positionId?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.getAttendances(params),
  });
}
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAttendanceRequest }) =>
      attendanceApi.updateAttendance(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all,
      });
    },
  });
}
