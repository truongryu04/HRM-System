import { format, isSameDay, isWeekend } from "date-fns";

import { Badge } from "../../components/ui/badge";
interface Props {
  date: Date;
  attendance?: any;
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
        {checkInTime && (
          <span className=" rounded bg-green-100 px-1.5 py-0.5 text-[14px] font-medium text-green-700">
            {checkInTime}
          </span>
        )}

        {checkOutTime && (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[14px] font-medium text-blue-700">
            {checkOutTime}
          </span>
        )}
      </div>
    </div>
  );
}
