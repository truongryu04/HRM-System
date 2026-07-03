import { useQuery } from "@tanstack/react-query";

import { attendanceApi } from "../services/attendance.api";

export const useAttendanceToday = () => {
  return useQuery({
    queryKey: ["attendance-today"],
    queryFn: attendanceApi.getToday,
  });
};
