import type { AttendanceCalendarResponse } from "@/types/attendance.type";
import { apiClient } from "./api-client";

export const attendanceApi = {
  getCalendar: async (
    month: number,
    year: number,
  ): Promise<AttendanceCalendarResponse> => {
    const response = await apiClient.get("/attendances/calendar", {
      params: {
        month,
        year,
      },
    });
    console.log(response.data);
    return response.data;
  },
  checkIn: async () => {
    const response = await apiClient.post("/attendances/check-in");

    return response.data;
  },

  checkOut: async () => {
    const response = await apiClient.post("/attendances/check-out");

    return response.data;
  },
  getToday: async () => {
    const response = await apiClient.get("/attendances/today");

    return response.data;
  },
};
