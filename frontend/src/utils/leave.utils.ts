import { formatDateOnly } from "./employee.utils";

export function formatLeaveDate(value?: string | null) {
  return formatDateOnly(value);
}

export function formatLeaveTotalDays(value: number | string) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 1,
  }).format(numericValue);
}

export function calculateLeaveDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diff = end.getTime() - start.getTime();

  if (diff < 0) {
    return 0;
  }

  return Math.floor(diff / 86_400_000) + 1;
}
