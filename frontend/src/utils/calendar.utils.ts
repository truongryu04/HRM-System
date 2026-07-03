import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export const generateCalendarDays = (month: number, year: number) => {
  const firstDay = startOfMonth(new Date(year, month - 1));

  const lastDay = endOfMonth(firstDay);

  const start = startOfWeek(firstDay, {
    weekStartsOn: 1,
  });

  const end = endOfWeek(lastDay, {
    weekStartsOn: 1,
  });

  return eachDayOfInterval({
    start,
    end,
  });
};
