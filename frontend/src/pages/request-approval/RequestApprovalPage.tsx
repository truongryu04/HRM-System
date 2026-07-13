import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Pagination } from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  useApproveRequest,
  usePendingApprovalRequests,
  useRejectRequest,
} from "../../hooks/useApprovalRequests";
import type { BusinessRequest } from "@/types/request.type";
import { ApprovalActionDialog } from "./components/ApprovalActionDialog";
import { RequestApprovalTable } from "./components/RequestApprovalTable";
import { RequestApprovalTabs } from "./components/RequestApprovalTabs";
import type { ApprovalQueueTab } from "@/types/request.type";
import { canProcess, isHandled } from "../../utils/request-approval.utils";

const PAGE_SIZE = 10;

export default function RequestApprovalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ApprovalQueueTab>("pending");
  const [page, setPage] = useState(1);
  const [actionRequest, setActionRequest] = useState<BusinessRequest | null>(
    null,
  );
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [note, setNote] = useState("");

  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = usePendingApprovalRequests();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const pendingRequests = useMemo(
    () => requests.filter((request) => canProcess(request)),
    [requests],
  );

  const recentlyHandledRequests = useMemo(
    () =>
      requests
        .filter((request) => isHandled(request))
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
        ),
    [requests],
  );

  const tabCounts = useMemo(
    () => ({
      pending: pendingRequests.length,
      "recently-handled": recentlyHandledRequests.length,
    }),
    [pendingRequests, recentlyHandledRequests],
  );

  const filteredRequests = useMemo(() => {
    if (activeTab === "recently-handled") {
      return recentlyHandledRequests;
    }

    return pendingRequests;
  }, [activeTab, pendingRequests, recentlyHandledRequests]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const processingId =
    approveMutation.variables?.id ?? rejectMutation.variables?.id;
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  const handleTabChange = (tab: ApprovalQueueTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openActionDialog = (
    request: BusinessRequest,
    type: "approve" | "reject",
  ) => {
    setActionRequest(request);
    setActionType(type);
    setNote("");
  };

  const closeActionDialog = () => {
    if (isSubmitting) {
      return;
    }

    setActionRequest(null);
    setActionType(null);
    setNote("");
  };

  const handleSubmitAction = async () => {
    if (!actionRequest || !actionType) {
      return;
    }

    if (actionType === "reject" && !note.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      if (actionType === "approve") {
        await approveMutation.mutateAsync({
          id: actionRequest.id,
          payload: { note: note.trim() || undefined },
        });
        toast.success("Đã duyệt yêu cầu");
      } else {
        await rejectMutation.mutateAsync({
          id: actionRequest.id,
          payload: { reason: note.trim() },
        });
        toast.success("Đã từ chối yêu cầu");
      }

      closeActionDialog();
    } catch {
      toast.error("Không thể cập nhật yêu cầu. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Yêu cầu cần duyệt
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và xử lý các yêu cầu đang chờ bạn phê duyệt.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RequestApprovalTabs
            activeTab={activeTab}
            counts={tabCounts}
            onTabChange={handleTabChange}
          />

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Đang tải danh sách yêu cầu cần duyệt...
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
            <RequestApprovalTable
              requests={paginatedRequests}
              mode={activeTab}
              processingId={processingId}
              onViewDetail={(request) =>
                navigate(`/requests/approval/${request.id}`)
              }
              onOpenApprove={(request) => openActionDialog(request, "approve")}
              onOpenReject={(request) => openActionDialog(request, "reject")}
            />
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

      <ApprovalActionDialog
        actionRequest={actionRequest}
        actionType={actionType}
        note={note}
        isSubmitting={isSubmitting}
        onNoteChange={setNote}
        onClose={closeActionDialog}
        onSubmit={() => void handleSubmitAction()}
      />
    </div>
  );
}
