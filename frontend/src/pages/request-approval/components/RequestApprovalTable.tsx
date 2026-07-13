import { CheckCircle2, Eye, XCircle } from "lucide-react";

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
import type { BusinessRequest } from "@/types/request.type";
import {
  canProcess,
  getRequestSummary,
  getStatusMeta,
} from "../../../utils/request-approval.utils";
import type { ApprovalQueueTab } from "@/types/request.type";

interface RequestApprovalTableProps {
  requests: BusinessRequest[];
  mode: ApprovalQueueTab;
  processingId?: number;
  onViewDetail: (request: BusinessRequest) => void;
  onOpenApprove: (request: BusinessRequest) => void;
  onOpenReject: (request: BusinessRequest) => void;
}

export function RequestApprovalTable({
  requests,
  mode,
  processingId,
  onViewDetail,
  onOpenApprove,
  onOpenReject,
}: RequestApprovalTableProps) {
  if (requests.length === 0) {
    return (
      <div className="flex min-h-28 items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {mode === "recently-handled"
          ? "Chưa có yêu cầu nào được xử lý gần đây."
          : "Không có yêu cầu nào đang chờ bạn duyệt."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người yêu cầu</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Bước duyệt</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Các thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const statusMeta = getStatusMeta(request.status);
            const disabled = processingId === request.id;

            return (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="font-medium">
                    {request.employee?.fullName ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.employee?.email ?? "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {request.employee?.department?.name ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.employee?.position?.name ?? ""}
                  </div>
                </TableCell>
                <TableCell className="max-w-80">
                  <div className="font-medium">
                    {request.requestType?.name ?? "-"}
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {request.code} - {getRequestSummary(request)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    Bước {request.currentStepOrder}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {canProcess(request) ? "Đang chờ xử lý" : "Đã xử lý"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusMeta.badgeClassName}>
                    {statusMeta.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {canProcess(request) ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-700 hover:text-emerald-700"
                          disabled={disabled}
                          onClick={() => onOpenApprove(request)}
                        >
                          <CheckCircle2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={disabled}
                          onClick={() => onOpenReject(request)}
                        >
                          <XCircle className="size-4" />
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(request)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
