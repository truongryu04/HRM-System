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
