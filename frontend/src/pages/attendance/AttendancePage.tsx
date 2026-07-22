import { useMemo, useState } from "react";

import { addMonths } from "date-fns";

import { Card } from "../../components/ui/card";

import { CalendarHeader } from "./CalendarHeader";
import { AttendanceCalendar } from "./AttendanceCalendar";

import { useAttendanceCalendar } from "../../hooks/useAttendanceCalendar";

import { generateCalendarDays } from "../../utils/calendar.utils";

import { useCheckIn } from "../../hooks/useCheckIn";
import { useCheckOut } from "../../hooks/useCheckOut";
import { useAttendanceToday } from "../../hooks/useAttendanceToday";
export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth() + 1;

  const year = currentDate.getFullYear();

  const { data } = useAttendanceCalendar(month, year);

  const days = useMemo(() => generateCalendarDays(month, year), [month, year]);
  const checkInMutation = useCheckIn(month, year);

  const checkOutMutation = useCheckOut(month, year);
  const { data: todayAttendance } = useAttendanceToday();
  const canCheckIn = !todayAttendance?.checkInTime;

  const canCheckOut =
    !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  return (
    <Card className="p-4 sm:p-6">
      <CalendarHeader
        month={month}
        year={year}
        onToday={() => setCurrentDate(new Date())}
        onPrev={() => setCurrentDate(addMonths(currentDate, -1))}
        onNext={() => setCurrentDate(addMonths(currentDate, 1))}
        onCheckIn={() => checkInMutation.mutate()}
        onCheckOut={() => checkOutMutation.mutate()}
        canCheckIn={canCheckIn}
        canCheckOut={canCheckOut}
      />

      <div className="mt-6 overflow-x-auto">
        <AttendanceCalendar days={days} calendarData={data?.calendar || {}} />
      </div>
    </Card>
  );
}
