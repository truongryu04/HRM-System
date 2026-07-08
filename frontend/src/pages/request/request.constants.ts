import type { LeaveStatus } from "@/types/leave.type";

export const leaveStatusOptions: Array<{
  value: LeaveStatus;
  label: string;
  className: string;
}> = [
  {
    value: "PENDING",
    label: "Chờ duyệt",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "IN_PROGRESS",
    label: "Đang duyệt",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    value: "APPROVED",
    label: "Đã duyệt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "REJECTED",
    label: "Từ chối",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  {
    value: "CANCELLED",
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
];

export function getLeaveStatusMeta(status: LeaveStatus) {
  return (
    leaveStatusOptions.find((option) => option.value === status) ??
    leaveStatusOptions[0]
  );
}
