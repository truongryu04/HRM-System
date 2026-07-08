import { ExternalLink, XCircle } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { LeaveRequest } from "@/types/leave.type";
import { getLeaveStatusMeta } from "../request.constants";
import { formatLeaveDate, formatLeaveTotalDays } from "../../../utils/leave.utils";

interface RequestTableProps {
  requests: LeaveRequest[];
  cancellingRequestId?: number | null;
  onCancel: (request: LeaveRequest) => void;
}

export function RequestTable({
  requests,
  cancellingRequestId,
  onCancel,
}: RequestTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã yêu cầu</TableHead>
            <TableHead>Loại yêu cầu</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Số ngày</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày gửi</TableHead>
            <TableHead>Tệp</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="h-28 text-center text-muted-foreground"
              >
                Bạn chưa gửi yêu cầu nào.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => {
              const statusMeta = getLeaveStatusMeta(request.status);
              const canCancel =
                request.status === "PENDING" ||
                request.status === "IN_PROGRESS";

              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.requestCode}
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.leaveType?.name ?? "-"}
                  </TableCell>
                  <TableCell>
                    {formatLeaveDate(request.startDate)} -{" "}
                    {formatLeaveDate(request.endDate)}
                  </TableCell>
                  <TableCell>
                    {formatLeaveTotalDays(request.totalDays)} ngày
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusMeta.className}>
                      {statusMeta.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatLeaveDate(request.createdAt)}</TableCell>
                  <TableCell>
                    {request.attachment ? (
                      <Button asChild variant="ghost" size="sm">
                        <a
                          href={request.attachment}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-4" />
                          Xem
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canCancel ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={cancellingRequestId === request.requestId}
                        onClick={() => onCancel(request)}
                      >
                        <XCircle className="size-4" />
                        Hủy
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
