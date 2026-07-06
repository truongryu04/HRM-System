import type {
  AttendanceCalendarResponse,
  AttendanceDashboard,
  AttendanceListResponse,
} from "@/types/attendance.type";

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

  getDashboard: async (): Promise<AttendanceDashboard> => {
    const response = await apiClient.get("/attendances/dashboard");

    return response.data;
  },

  getAttendances: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    date?: string;
    departmentId?: number;
    positionId?: number;
    status?: string;
  }): Promise<AttendanceListResponse> => {
    const response = await apiClient.get("/attendances", {
      params,
    });

    return response.data;
  },
};
