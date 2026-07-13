import { RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Pagination } from "../../components/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { usePendingApprovalRequests } from "../../hooks/useApprovalRequests";
import { cn } from "../../lib/utils";
import type { BusinessRequest, RequestStatus } from "@/types/leave.type";
import { formatDateTime } from "../../utils/employee.utils";

const PAGE_SIZE = 10;

const approvalStatusTabs: Array<{
  value: RequestStatus;
  label: string;
  badgeClassName: string;
}> = [
  {
    value: "pending",
    label: "Đang chờ duyệt",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "confirmed",
    label: "Đã xác nhận",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    value: "approved",
    label: "Đã chấp nhận",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "rejected",
    label: "Đã từ chối",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },
  {
    value: "canceled",
    label: "Đã huỷ",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
  },
];

function getStatusMeta(status: RequestStatus) {
  return (
    approvalStatusTabs.find((item) => item.value === status) ??
    approvalStatusTabs[0]
  );
}

function RequestApprovalTable({ requests }: { requests: BusinessRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="flex min-h-28 items-center justify-center text-2xl text-muted-foreground">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã yêu cầu</TableHead>
            <TableHead>Loại yêu cầu</TableHead>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Bước hiện tại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày gửi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const statusMeta = getStatusMeta(request.status);

            return (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.code}</TableCell>
                <TableCell>{request.requestType?.name ?? "-"}</TableCell>
                <TableCell>
                  <div className="font-medium">
                    {request.employee?.fullName ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.employee?.employeeCode ?? ""}
                  </div>
                </TableCell>
                <TableCell className="max-w-[320px] truncate">
                  {request.title}
                </TableCell>
                <TableCell>{request.currentStepOrder}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusMeta.badgeClassName}>
                    {statusMeta.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDateTime(request.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function RequestApprovalPage() {
  const [activeStatus, setActiveStatus] = useState<RequestStatus>("pending");
  const [page, setPage] = useState(1);

  const {
    data: requests = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = usePendingApprovalRequests();

  const filteredRequests = useMemo(
    () => requests.filter((request) => request.status === activeStatus),
    [activeStatus, requests],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleStatusChange = (status: RequestStatus) => {
    setActiveStatus(status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Yêu cầu cần duyệt
          </h1>
          <p className="text-muted-foreground">
            Theo dõi các yêu cầu đang chờ bạn xử lý theo từng trạng thái.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCcw className="size-4" />
          Làm mới
        </Button>
      </div>

      <Card className="rounded-md py-0">
        <CardContent className="px-5 py-0">
          <div className="flex min-h-20 flex-wrap items-end gap-1 border-b">
            {approvalStatusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={cn(
                  "h-20 px-5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                  activeStatus === tab.value &&
                    "border-b border-teal-500 text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex min-h-28 items-center justify-center text-muted-foreground">
              Đang tải danh sách yêu cầu...
            </div>
          ) : isError ? (
            <div className="space-y-3 py-12 text-center">
              <p className="text-destructive">
                Không thể tải danh sách yêu cầu cần duyệt.
              </p>
              <Button variant="outline" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <RequestApprovalTable requests={paginatedRequests} />
          )}
        </CardContent>
      </Card>

      {!isLoading && !isError && filteredRequests.length > 0 ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredRequests.length}
          pageSize={PAGE_SIZE}
          setPage={setPage}
          itemName="yêu cầu"
        />
      ) : null}
    </div>
  );
}
