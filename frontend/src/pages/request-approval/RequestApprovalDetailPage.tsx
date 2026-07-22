import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import {
  useApproveRequest,
  useRejectRequest,
  useRequestDetail,
} from "../../hooks/useApprovalRequests";
import { useLeaveRequestByRequestId } from "../../hooks/useLeaveRequests";
import { formatDateTime } from "../../utils/employee.utils";
import { formatLeaveDate, formatLeaveTotalDays } from "../../utils/leave.utils";
import type { LeaveRequest } from "@/types/leave.type";
import type {
  BusinessRequest,
  BusinessRequestDetail,
} from "@/types/request.type";
import {
  approvalStepStatusMeta,
  canProcess,
  formatWaitingTime,
  getApproverLabel,
  getEmployeeOrgLabel,
  getStatusMeta,
  getUserLabel,
} from "../../utils/request-approval.utils";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";

export default function RequestApprovalDetailPage() {
  const { can } = usePermissionAccess();
  const canApprove = can(PERMISSIONS.REQUEST.APPROVE);
  const canReject = can(PERMISSIONS.REQUEST.REJECT);
  const navigate = useNavigate();
  const { id } = useParams();
  const requestId = Number(id);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [note, setNote] = useState("");

  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useRequestDetail(Number.isFinite(requestId) ? requestId : undefined);
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const request = detail?.request;
  const isLeaveRequest = request ? isLeaveRequestType(request) : false;
  const { data: leaveRequest } = useLeaveRequestByRequestId(
    request?.id,
    isLeaveRequest,
  );
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;
  const statusMeta = request ? getStatusMeta(request.status) : null;

  const openActionDialog = (type: "approve" | "reject") => {
    if (
      (type === "approve" && !canApprove) ||
      (type === "reject" && !canReject)
    ) {
      return;
    }
    setActionType(type);
    setNote("");
  };

  const closeActionDialog = () => {
    if (isSubmitting) {
      return;
    }

    setActionType(null);
    setNote("");
  };

  const handleSubmitAction = async () => {
    if (!request || !actionType) {
      return;
    }

    if (actionType === "reject" && !note.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      if (actionType === "approve" && canApprove) {
        await approveMutation.mutateAsync({
          id: request.id,
          payload: { note: note.trim() || undefined },
        });
        toast.success("Đã duyệt yêu cầu");
      } else if (canReject) {
        await rejectMutation.mutateAsync({
          id: request.id,
          payload: { reason: note.trim() },
        });
        toast.success("Đã từ chối yêu cầu");
      }

      closeActionDialog();
      await refetch();
    } catch {
      toast.error("Không thể cập nhật yêu cầu. Vui lòng thử lại.");
    }
  };

  if (!Number.isFinite(requestId)) {
    return (
      <DetailErrorState
        message="Mã yêu cầu không hợp lệ."
        onBack={() => navigate("/requests/approval")}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Đang tải chi tiết yêu cầu...
      </div>
    );
  }

  if (isError || !detail || !request) {
    return (
      <DetailErrorState
        message="Không thể tải chi tiết yêu cầu."
        onBack={() => navigate("/requests/approval")}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Chi tiết đơn duyệt
                </h1>
                <Badge variant="outline" className={statusMeta?.badgeClassName}>
                  {statusMeta?.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canProcess(request) && (canApprove || canReject) ? (
              <>
                {canApprove ? (
                  <Button
                    className="bg-teal-500 text-white hover:bg-teal-700"
                    onClick={() => openActionDialog("approve")}
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 className="size-4" />
                    Duyệt
                  </Button>
                ) : null}
                {canReject ? (
                  <Button
                    variant="destructive"
                    onClick={() => openActionDialog("reject")}
                    disabled={isSubmitting}
                  >
                    <XCircle className="size-4" />
                    Từ chối
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.55fr)]">
          <div className="space-y-6">
            <RequestInfoCard detail={detail} leaveRequest={leaveRequest} />
            <ApprovalStepsCard detail={detail} />
          </div>

          <div className="space-y-6">
            <RequesterInfoCard request={request} />
            <HistoryCard detail={detail} />
          </div>
        </div>

        <Dialog open={Boolean(actionType)} onOpenChange={closeActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Duyệt yêu cầu" : "Từ chối yêu cầu"}
              </DialogTitle>
              <DialogDescription>
                {request.code} - {request.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="approval-note">
                {actionType === "approve" ? "Ghi chú" : "Lý do từ chối"}
              </label>
              <Textarea
                id="approval-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Nhập ghi chú nếu cần"
                    : "Nhập lý do từ chối"
                }
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeActionDialog}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className={
                  actionType === "approve"
                    ? "bg-teal-500 text-white hover:bg-teal-700"
                    : undefined
                }
                variant={actionType === "reject" ? "destructive" : "default"}
                onClick={() => void handleSubmitAction()}
                disabled={isSubmitting}
              >
                {actionType === "approve" ? "Duyệt" : "Từ chối"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

function RequesterInfoCard({ request }: { request: BusinessRequest }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin người gửi</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4">
          <DetailItem label="Tên" value={request.employee?.fullName ?? "-"} />
          <DetailItem label="Email" value={request.employee?.email ?? "-"} />
          <DetailItem
            label="Phòng ban"
            value={request.employee?.department?.name ?? "-"}
          />
          <DetailItem
            label="Vị trí"
            value={request.employee?.position?.name ?? "-"}
          />
          <DetailItem
            label="Mã nhân viên"
            value={request.employee?.employeeCode ?? "-"}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function RequestInfoCard({
  detail,
  leaveRequest,
}: {
  detail: BusinessRequestDetail;
  leaveRequest?: LeaveRequest;
}) {
  const { request } = detail;
  const statusMeta = getStatusMeta(request.status);
  const deadline =
    leaveRequest && leaveRequest.startDate && leaveRequest.endDate
      ? formatLeaveDeadline(leaveRequest)
      : formatWaitingTime(request);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin yêu cầu</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 md:grid-cols-2">
          <DetailItem label="Mã yêu cầu" value={request.code} />
          <DetailItem
            label="Loại yêu cầu"
            value={request.requestType?.name ?? "-"}
          />
          <DetailItem label="Trạng thái" value={statusMeta.label} />
          <DetailItem
            label="Bước hiện tại"
            value={`Bước ${request.currentStepOrder}`}
          />
          <DetailItem
            label="Thời gian chờ"
            value={formatWaitingTime(request)}
          />
          <DetailItem label="Thời hạn" value={deadline} />
          <DetailItem
            label="Ngày gửi"
            value={formatDateTime(request.createdAt)}
          />
          <DetailItem
            label="Cập nhật gần nhất"
            value={formatDateTime(request.updatedAt)}
          />
          <DetailItem
            label="Phòng ban / vị trí"
            value={getEmployeeOrgLabel(request)}
          />
          {leaveRequest ? (
            <>
              <DetailItem
                label="Loại nghỉ"
                value={leaveRequest.leaveType?.name ?? "-"}
              />
              <DetailItem
                label="Số ngày"
                value={`${formatLeaveTotalDays(leaveRequest.totalDays)} ngày`}
              />
            </>
          ) : null}
          <div className="space-y-1 md:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">
              Nội dung
            </dt>
            <dd className="rounded-md border bg-muted/30 p-3 text-sm">
              {request.title || "-"}
            </dd>
          </div>
          <div className="space-y-1 md:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">Lý do</dt>
            <dd className="rounded-md border bg-muted/30 p-3 text-sm">
              {leaveRequest?.reason?.trim() || request.note?.trim() || "-"}
            </dd>
          </div>
          {leaveRequest?.attachment ? (
            <div className="space-y-1 md:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Tệp đính kèm
              </dt>
              <dd className="rounded-md border bg-muted/30 p-3 text-sm">
                {leaveRequest.attachment}
              </dd>
            </div>
          ) : null}
          {request.rejectionReason ? (
            <div className="space-y-1 md:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Lý do từ chối
              </dt>
              <dd className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {request.rejectionReason}
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

function ApprovalStepsCard({ detail }: { detail: BusinessRequestDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Các bước duyệt</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bước</TableHead>
                <TableHead>Người duyệt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đã xử lý bởi</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.approvals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-20 text-center text-muted-foreground"
                  >
                    Chưa có bước duyệt.
                  </TableCell>
                </TableRow>
              ) : (
                detail.approvals.map((approval) => {
                  const meta = approvalStepStatusMeta[approval.status];

                  return (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div className="font-medium">
                          {approval.stepOrder}. {approval.stepName}
                        </div>
                      </TableCell>
                      <TableCell>{getApproverLabel(approval)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={meta.className}>
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{getUserLabel(approval.actedBy)}</TableCell>
                      <TableCell>{formatDateTime(approval.actedAt)}</TableCell>
                      <TableCell className="max-w-64">
                        <span className="line-clamp-2">
                          {approval.note ?? "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryCard({ detail }: { detail: BusinessRequestDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử xử lý</CardTitle>
      </CardHeader>
      <CardContent>
        {detail.histories.length === 0 ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
            Chưa có lịch sử xử lý.
          </div>
        ) : (
          <div className="space-y-3">
            {detail.histories.map((history) => (
              <div
                key={history.id}
                className="rounded-md border bg-muted/20 p-3"
              >
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium">{history.action}</span>
                  <span className="text-muted-foreground">
                    {formatDateTime(history.createdAt)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {getUserLabel(history.actor)}
                </div>
                {history.note ? (
                  <p className="mt-2 text-sm">{history.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function DetailErrorState({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-4 py-12 text-center">
      <p className="text-destructive">{message}</p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Quay lại
        </Button>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Thử lại
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function isLeaveRequestType(request: BusinessRequest) {
  const handlerKey = request.requestType?.handlerKey;
  const code = request.requestType?.code;

  return handlerKey === "leave-request" || code === "LEAVE_REQUEST";
}

function formatLeaveDeadline(request: LeaveRequest) {
  const startDate = formatLeaveDate(request.startDate);
  const endDate = formatLeaveDate(request.endDate);

  if (startDate === endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}
