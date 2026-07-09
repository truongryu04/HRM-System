import type { RequestTypeRequest } from "@/types/request-type.type";

export type RequestTypeMode = "create" | "edit";

export const emptyRequestTypeForm: RequestTypeRequest = {
  code: "",
  name: "",
  handlerKey: "",
  isActive: true,
  description: "",
};

export const defaultRequestTypes: RequestTypeRequest[] = [
  {
    code: "LEAVE_REQUEST",
    name: "Xin nghỉ phép",
    handlerKey: "leave-request",
    isActive: true,
    description: "Yêu cầu nghỉ phép có phê duyệt.",
  },
  {
    code: "ATTENDANCE_CORRECTION",
    name: "Sửa chấm công",
    handlerKey: "attendance-correction",
    isActive: true,
    description: "Yêu cầu điều chỉnh dữ liệu chấm công.",
  },
  {
    code: "OVERTIME_REGISTRATION",
    name: "Đăng ký OT",
    handlerKey: "overtime-registration",
    isActive: true,
    description: "Yêu cầu đăng ký làm thêm giờ.",
  },
  {
    code: "SHIFT_CHANGE",
    name: "Đổi ca làm việc",
    handlerKey: "shift-change",
    isActive: true,
    description: "Yêu cầu đổi ca hoặc lịch làm việc.",
  },
  {
    code: "EQUIPMENT_BORROW",
    name: "Mượn thiết bị",
    handlerKey: "equipment-borrow",
    isActive: true,
    description: "Yêu cầu mượn thiết bị nội bộ.",
  },
];
