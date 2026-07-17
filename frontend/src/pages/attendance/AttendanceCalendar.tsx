import { format } from "date-fns";

import { CalendarCell } from "./CalendarCell";
import type { AttendanceCalendarDay } from "../../types/attendance.type";

interface Props {
  days: Date[];
  calendarData: Record<string, AttendanceCalendarDay>;
}

const weekDays = [
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
  "Chủ nhật",
];

export function AttendanceCalendar({ days, calendarData }: Props) {
  return (
    <>
      <div className="grid grid-cols-7">
        {weekDays.map((day) => (
          <div
            key={day}
            className="
              bg-primary
              text-white
              text-center
              py-4
              font-semibold
              text-xl
            "
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
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
    </>
  );
}
