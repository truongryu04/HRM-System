import { format, isBefore, isSameDay, isWeekend, startOfDay } from "date-fns";

import type { AttendanceCalendarDay } from "../../types/attendance.type";
interface Props {
  date: Date;
  attendance?: AttendanceCalendarDay;
}

export function CalendarCell({ date, attendance }: Props) {
  const today = isSameDay(date, new Date());

  const weekend = isWeekend(date);
  const checkInTime = attendance?.checkInTime
    ? format(new Date(attendance.checkInTime), "HH:mm")
    : null;

  const checkOutTime = attendance?.checkOutTime
    ? format(new Date(attendance.checkOutTime), "HH:mm")
    : null;
  const isOnLeave = Boolean(attendance?.leave);
  const shouldShowAttendance = attendance?.leave?.session !== "FULL";
  const leaveLabel =
    attendance?.leave?.session === "AM"
      ? "Nghỉ phép sáng"
      : attendance?.leave?.session === "PM"
        ? "Nghỉ phép chiều"
        : "Nghỉ phép";
  const isAbsent =
    !weekend &&
    isBefore(startOfDay(date), startOfDay(new Date())) &&
    !checkInTime &&
    !checkOutTime &&
    !isOnLeave;

  const checkInClass = attendance?.isLate
    ? "bg-[#fd3995] text-white ring-1 ring-rose-200"
    : "bg-teal-500 text-white";
  const checkOutClass = attendance?.isEarlyLeave
    ? "bg-[#fd3995] text-white ring-1 ring-rose-200"
    : "bg-teal-500 text-white";

  return (
    <div
      className={`
        border-r border-b
        p-2
        min-h-[140px]
        relative
        ${weekend ? "bg-cyan-50" : ""}
        ${today ? "bg-yellow-50" : ""}
      `}
    >
      <div className="flex justify-end">
        <span className="text-lg">{format(date, "d")}</span>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {shouldShowAttendance && checkInTime && (
          <span
            className={`inline-flex min-w-12 items-center justify-center rounded-full px-1.5 py-0.5 text-sm font-medium ${checkInClass}`}
            title={attendance?.isLate ? "Check-in muộn" : "Giờ check-in"}
          >
            {checkInTime}
          </span>
        )}

        {shouldShowAttendance && checkOutTime && (
          <span
            className={`inline-flex min-w-12 items-center justify-center rounded-full px-1.5 py-0.5 text-sm font-medium ${checkOutClass}`}
            title={attendance?.isEarlyLeave ? "Check-out sớm" : "Giờ check-out"}
          >
            {checkOutTime}
          </span>
        )}

        {isOnLeave && (
          <span
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-2 py-0.5 text-sm font-medium text-white"
            title={attendance?.leave?.type}
            aria-label={`${leaveLabel}: ${attendance?.leave?.type}`}
          >
            {leaveLabel}
          </span>
        )}

        {isAbsent && (
          <span
            className="inline-flex min-w-12 items-center justify-center rounded-full bg-[#fd3995] px-1.5 py-0.5 text-sm font-medium text-white"
            aria-label="Không có dữ liệu check-in và check-out"
          >
            K
          </span>
        )}
      </div>
    </div>
  );
}
