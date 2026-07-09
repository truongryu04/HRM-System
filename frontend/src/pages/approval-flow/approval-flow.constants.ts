import type { ApproverType } from "@/types/request-config.type";

export const approverTypeOptions: Array<{
  value: ApproverType;
  label: string;
}> = [
  { value: "DIRECT_MANAGER", label: "Quản lý trực tiếp" },
  { value: "ROLE", label: "Theo role" },
  { value: "POSITION", label: "Theo vị trí" },
  { value: "SPECIFIC_USER", label: "Người dùng cụ thể" },
];

export function getApproverTypeLabel(value: ApproverType) {
  return (
    approverTypeOptions.find((option) => option.value === value)?.label ?? value
  );
}
