import type { EmployeeGender, EmployeeStatus } from "@/types/employee.type";

export const employeePageSize = 10;

export const employeeGenderOptions: Array<{
  value: EmployeeGender;
  label: string;
}> = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

export const employeeStatusOptions: Array<{
  value: EmployeeStatus;
  label: string;
}> = [
  { value: "ACTIVE", label: "Đang làm việc" },
  { value: "INACTIVE", label: "Tạm nghỉ" },
  { value: "RESIGNED", label: "Đã nghỉ" },
  { value: "ON_LEAVE", label: "Nghỉ phép" },
  { value: "TERMINATED", label: "Sa thải" },
];
export const employeeStatusBadgeClass: Record<EmployeeStatus, string> = {
  ACTIVE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  INACTIVE: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  RESIGNED: "border-slate-500/20 bg-slate-500/10 text-slate-700",
  ON_LEAVE: "border-blue-500/20 bg-blue-500/10 text-blue-700",
  TERMINATED: "border-red-500/20 bg-red-500/10 text-red-700",
};

export const departmentTagClass =
  "border-sky-500/20 bg-sky-500/10 text-sky-700";

export const positionTagClass =
  "border-violet-500/20 bg-violet-500/10 text-violet-700";
