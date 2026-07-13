import type {
  BusinessRequest,
  RequestApproval,
  RequestApprovalStatus,
  RequestStatus,
} from "@/types/request.type";
import type { User } from "@/types/user.type";

export const SOON_OVERDUE_HOURS = 24;

export const requestStatusMeta: Record<
  RequestStatus,
  { label: string; badgeClassName: string }
> = {
  pending: {
    label: "Chờ duyệt",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  confirmed: {
    label: "Đã xác nhận",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  approved: {
    label: "Đã duyệt",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Đã từ chối",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },
  canceled: {
    label: "Đã hủy",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

export const approvalStepStatusMeta: Record<
  RequestApprovalStatus,
  { label: string; className: string }
> = {
  WAITING: {
    label: "Đang chờ",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  PENDING: {
    label: "Cần xử lý",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Từ chối",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  SKIPPED: {
    label: "Bỏ qua",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

export function getStatusMeta(status: RequestStatus) {
  return requestStatusMeta[status] ?? requestStatusMeta.pending;
}

export function getUserLabel(user?: User | null) {
  return user?.employee?.fullName ?? user?.email ?? "-";
}

export function getApproverLabel(approval: RequestApproval) {
  if (approval.approverType === "SPECIFIC_USER") {
    return getUserLabel(approval.specificUser);
  }

  if (approval.approverType === "ROLE") {
    return approval.roleCode ?? "-";
  }

  if (approval.approverType === "POSITION") {
    return approval.positionCode ?? "-";
  }

  return "Quản lý trực tiếp";
}

export function canProcess(request: BusinessRequest) {
  return request.status === "pending" || request.status === "confirmed";
}

export function isHandled(request: BusinessRequest) {
  return request.status === "approved" || request.status === "rejected";
}

export function getWaitingHours(request: BusinessRequest) {
  const createdAt = new Date(request.createdAt).getTime();

  if (Number.isNaN(createdAt)) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - createdAt) / 36e5));
}

export function formatWaitingTime(request: BusinessRequest) {
  const waitingHours = getWaitingHours(request);

  if (waitingHours < 1) {
    return "Dưới 1 giờ";
  }

  const days = Math.floor(waitingHours / 24);
  const hours = waitingHours % 24;

  if (days === 0) {
    return `${hours} giờ`;
  }

  return hours > 0 ? `${days} ngày ${hours} giờ` : `${days} ngày`;
}

export function getEmployeeOrgLabel(request: BusinessRequest) {
  const department = request.employee.department?.name;
  const position = request.employee.position?.name;

  if (department && position) {
    return `${department} / ${position}`;
  }

  return department ?? position ?? "-";
}

export function getRequestSummary(request: BusinessRequest) {
  return request.note ? `${request.title} - ${request.note}` : request.title;
}
