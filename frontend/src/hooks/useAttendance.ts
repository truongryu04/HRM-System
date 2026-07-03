import { useQuery } from "@tanstack/react-query";

import { attendanceApi } from "../services/attendance.api";

export const attendanceKeys = {
  all: ["attendance"] as const,

  dashboard: () => [...attendanceKeys.all, "dashboard"] as const,

  list: (params?: unknown) => [...attendanceKeys.all, "list", params] as const,
};

export function useAttendanceDashboard() {
  return useQuery({
    queryKey: attendanceKeys.dashboard(),
    queryFn: attendanceApi.getDashboard,
  });
}

export function useAttendances(params?: {
  page?: number;
  limit?: number;
  search?: string;
  attendanceDate?: string;
  departmentId?: number;
  positionId?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.getAttendances(params),
  });
}
