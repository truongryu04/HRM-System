import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useLeaveRequests } from "../../hooks/useLeaveRequests";
import { RequestTable } from "./components/RequestTable";
import { CanAccess } from "../../components/auth/CanAccess";
import { PERMISSIONS } from "../../constants/permissions";

export default function RequestPage() {
  const navigate = useNavigate();

  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useLeaveRequests();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Yêu cầu của tôi
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <CanAccess permission={PERMISSIONS.REQUEST.CREATE}>
              <Button
                onClick={() => navigate("/requests/create")}
                variant="primary"
              >
                <Plus className="size-4" />
                Thêm yêu cầu mới
              </Button>
            </CanAccess>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Đang tải danh sách yêu cầu...
              </div>
            ) : isError ? (
              <div className="space-y-3 py-12 text-center">
                <p className="text-destructive">
                  Không thể tải danh sách yêu cầu.
                </p>
                <Button variant="outline" onClick={() => void refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : (
              <RequestTable requests={requests} />
            )}
          </CardContent>
        </Card>
      </div>
    </Card>
  );
}
