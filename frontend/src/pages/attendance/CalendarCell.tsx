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
        min-w-0 p-0.5 sm:p-2
        min-h-20 sm:min-h-[140px]
        relative
        ${weekend ? "bg-cyan-50" : ""}
        ${today ? "bg-yellow-50" : ""}
      `}
    >
      <div className="flex justify-end">
        <span className="text-sm sm:text-lg">{format(date, "d")}</span>
      </div>

      <div className="mt-1 flex min-w-0 flex-col items-center gap-1 sm:mt-2 sm:flex-row sm:flex-wrap sm:justify-center">
        {shouldShowAttendance && checkInTime && (
          <span
            className={`inline-flex w-full min-w-0 items-center justify-center rounded-full px-0.5 py-0.5 text-[10px] font-medium sm:w-auto sm:min-w-12 sm:px-1.5 sm:text-sm ${checkInClass}`}
            title={attendance?.isLate ? "Check-in muộn" : "Giờ check-in"}
          >
            {checkInTime}
          </span>
        )}

        {shouldShowAttendance && checkOutTime && (
          <span
            className={`inline-flex w-full min-w-0 items-center justify-center rounded-full px-0.5 py-0.5 text-[10px] font-medium sm:w-auto sm:min-w-12 sm:px-1.5 sm:text-sm ${checkOutClass}`}
            title={attendance?.isEarlyLeave ? "Check-out sớm" : "Giờ check-out"}
          >
            {checkOutTime}
          </span>
        )}

        {isOnLeave && (
          <span
            className="inline-flex w-full min-w-0 items-center justify-center truncate rounded-full bg-sky-600 px-0.5 py-0.5 text-[10px] font-medium text-white sm:w-auto sm:px-2 sm:text-sm"
            title={attendance?.leave?.type}
            aria-label={`${leaveLabel}: ${attendance?.leave?.type}`}
          >
            {leaveLabel}
          </span>
        )}

        {isAbsent && (
          <span
            className="inline-flex w-full min-w-0 items-center justify-center rounded-full bg-[#fd3995] px-0.5 py-0.5 text-[10px] font-medium text-white sm:w-auto sm:min-w-12 sm:px-1.5 sm:text-sm"
            aria-label="Không có dữ liệu check-in và check-out"
          >
            K
          </span>
        )}
      </div>
    </div>
  );
}
