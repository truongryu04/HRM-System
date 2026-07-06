export interface AttendanceCalendarDay {
  checkInTime: string | null;
  checkOutTime: string | null;
  workingDayValue: number;
  lateMinutes: number;
  isLate: boolean;
  earlyLeaveMinutes: number;
  isEarlyLeave: boolean;
}

export interface AttendanceCalendarResponse {
  month: number;
  year: number;
  calendar: Record<string, AttendanceCalendarDay>;
}
export interface TodayAttendance {
  id: number;
  attendanceDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workMinutes: number | null;
  workingDayValue: number | null;
  lateMinutes: number;
  isLate: boolean;
  earlyLeaveMinutes: number;
  isEarlyLeave: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface AttendanceDashboard {
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  working: number;
}
export interface Attendance {
  id: number;

  attendanceDate: string;

  checkInTime: string | null;

  checkOutTime: string | null;

  workMinutes: number;

  lateMinutes: number;

  isLate: boolean;
  note: string | null;
  employee: {
    id: number;

    employeeCode: string;

    fullName: string;

    department: {
      id: number;
      name: string;
      code: string;
    };

    position: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface AttendanceListResponse {
  data: Attendance[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface UpdateAttendanceRequest {
  checkInTime?: string | null;
  checkOutTime?: string | null;
  note?: string;
}
