import { useQuery } from "@tanstack/react-query";

import { attendanceApi } from "../services/attendance.api";

export const useAttendanceToday = (enabled = true) => {
  return useQuery({
    queryKey: ["attendance-today"],
    queryFn: attendanceApi.getToday,
    enabled,
  });
};
