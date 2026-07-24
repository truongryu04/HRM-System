import { useMemo, useState } from "react";

import { addMonths } from "date-fns";
import { UserRoundX } from "lucide-react";

import { Card } from "../../components/ui/card";

import { CalendarHeader } from "./CalendarHeader";
import { AttendanceCalendar } from "./AttendanceCalendar";

import { useAttendanceCalendar } from "../../hooks/useAttendanceCalendar";

import { generateCalendarDays } from "../../utils/calendar.utils";

import { useCheckIn } from "../../hooks/useCheckIn";
import { useCheckOut } from "../../hooks/useCheckOut";
import { useAttendanceToday } from "../../hooks/useAttendanceToday";
import { useAuthStore } from "../../store/auth.store";
export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const hasLinkedEmployee =
    Number.isInteger(employeeId) && Number(employeeId) > 0;

  const month = currentDate.getMonth() + 1;

  const year = currentDate.getFullYear();

  const { data } = useAttendanceCalendar(month, year, hasLinkedEmployee);

  const days = useMemo(() => generateCalendarDays(month, year), [month, year]);
  const checkInMutation = useCheckIn(month, year);

  const checkOutMutation = useCheckOut(month, year);
  const { data: todayAttendance } = useAttendanceToday(hasLinkedEmployee);
  const canCheckIn = !todayAttendance?.checkInTime;

  const canCheckOut =
    !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;

  if (!hasLinkedEmployee) {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          <UserRoundX className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-semibold">Tài khoản chưa liên kết nhân viên</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Liên kết tài khoản với một hồ sơ nhân viên để xem lịch làm việc và
            sử dụng chức năng chấm công.
          </p>
        </div>
      </Card>
    );
  }

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
