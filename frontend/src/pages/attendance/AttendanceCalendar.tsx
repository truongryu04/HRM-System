import { format } from "date-fns";

import { CalendarCell } from "./CalendarCell";
import type { AttendanceCalendarDay } from "../../types/attendance.type";

interface Props {
  days: Date[];
  calendarData: Record<string, AttendanceCalendarDay>;
}

const weekDays = [
  { full: "Thứ hai", short: "T2" },
  { full: "Thứ ba", short: "T3" },
  { full: "Thứ tư", short: "T4" },
  { full: "Thứ năm", short: "T5" },
  { full: "Thứ sáu", short: "T6" },
  { full: "Thứ bảy", short: "T7" },
  { full: "Chủ nhật", short: "CN" },
];

export function AttendanceCalendar({ days, calendarData }: Props) {
  return (
    <div className="w-full min-w-0 overflow-hidden border-l border-t border-border bg-background">
      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))]">
        {weekDays.map((day) => (
          <div
            key={day.short}
            className="min-w-0 border-b border-r border-primary-foreground/25 bg-primary px-0.5 py-2 text-center text-xs font-semibold text-white sm:py-3 sm:text-sm lg:text-base xl:py-4 xl:text-lg"
          >
            <span className="hidden md:inline">{day.full}</span>
            <span className="md:hidden">{day.short}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))]">
        {days.map((date) => {
          const key = format(date, "yyyy-MM-dd");
          //   console.log("key =", key);
          //   console.log("attendance =", calendarData[key]);

          return (
            <CalendarCell
              key={key}
              date={date}
              attendance={calendarData[key]}
            />
          );
        })}
      </div>
    </div>
  );
}
