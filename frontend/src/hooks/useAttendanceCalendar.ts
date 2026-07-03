import { useQuery } from "@tanstack/react-query";

import { attendanceApi } from "../services/attendance.api";

export const useAttendanceCalendar = (month: number, year: number) => {
  return useQuery({
    queryKey: ["attendance-calendar", month, year],
    queryFn: () => attendanceApi.getCalendar(month, year),
  });
};
