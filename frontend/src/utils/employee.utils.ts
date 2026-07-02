import type { EmployeeGender, EmployeeStatus } from "@/types/employee.type";

import {
  employeeGenderOptions,
  employeeStatusOptions,
} from "../pages/employee/employee.constants";

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatDateOnly(value?: string | null) {
  if (!value) {
    return "-";
  }

  const dateKey = value.slice(0, 10);
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function normalizeDateKey(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function statusLabel(value: EmployeeStatus) {
  return (
    employeeStatusOptions.find((option) => option.value === value)?.label ??
    value
  );
}

export function genderLabel(value: EmployeeGender) {
  return (
    employeeGenderOptions.find((option) => option.value === value)?.label ??
    value
  );
}
