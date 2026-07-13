import { useState } from "react";
import { Eye } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { LeaveRequest, LeaveStatus } from "@/types/leave.type";
import type { User } from "@/types/user.type";
import { formatLeaveDate, formatLeaveTotalDays } from "../../../utils/leave.utils";

interface RequestTableProps {
  requests: LeaveRequest[];
}

const statusMeta: Record<
  LeaveStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Chờ duyệt",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  approved: {
    label: "Đã duyệt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Từ chối",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  canceled: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

function getUserLabel(user?: User | null) {
  return user?.employee?.fullName ?? user?.email ?? "-";
}

function getHandlerLabel(request: LeaveRequest) {
  if (request.status === "approved") {
    return getUserLabel(request.approvedBy);
  }

  if (request.status === "rejected") {
    return getUserLabel(request.request?.rejectedBy);
  }

  if (request.status === "canceled") {
    return "Đã hủy";
  }

  return `Đang chờ bước ${request.request?.currentStepOrder ?? "-"}`;
}

function getRequestContent(request: LeaveRequest) {
  return request.request?.requestType?.name ?? request.leaveType?.name ?? "-";
}

function formatDeadline(request: LeaveRequest) {
  const startDate = formatLeaveDate(request.startDate);
  const endDate = formatLeaveDate(request.endDate);

  if (startDate === endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function RequestTable({ requests }: RequestTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người xử lý</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-muted-foreground"
                >
                  Bạn chưa gửi yêu cầu nào.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const meta = statusMeta[request.status] ?? statusMeta.pending;

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">
                        {getRequestContent(request)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.requestCode}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={meta.className}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{getHandlerLabel(request)}</TableCell>
                    <TableCell>{formatDeadline(request)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="size-4" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu</DialogTitle>
            <DialogDescription>
              {selectedRequest?.requestCode ?? ""}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Nội dung"
                value={getRequestContent(selectedRequest)}
              />
              <DetailItem
                label="Loại nghỉ"
                value={selectedRequest.leaveType?.name ?? "-"}
              />
              <DetailItem
                label="Trạng thái"
                value={
                  (statusMeta[selectedRequest.status] ?? statusMeta.pending)
                    .label
                }
              />
              <DetailItem
                label="Người xử lý"
                value={getHandlerLabel(selectedRequest)}
              />
              <DetailItem
                label="Thời hạn"
                value={formatDeadline(selectedRequest)}
              />
              <DetailItem
                label="Số ngày"
                value={`${formatLeaveTotalDays(selectedRequest.totalDays)} ngày`}
              />
              <div className="space-y-1 sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground">
                  Lý do
                </dt>
                <dd className="rounded-md border bg-muted/30 p-3 text-sm">
                  {selectedRequest.reason || "-"}
                </dd>
              </div>
              {selectedRequest.rejectReason ? (
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Lý do từ chối
                  </dt>
                  <dd className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {selectedRequest.rejectReason}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
