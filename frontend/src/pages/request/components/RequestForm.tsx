import { useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import type {
  CreateLeaveRequest,
  LeaveSession,
  LeaveType,
} from "@/types/leave.type";
import type { RequestType } from "@/types/request-type.type";
import { calculateLeaveDays } from "../../../utils/leave.utils";
import { RemainingLeaveBalance } from "./RemainingLeaveBalance";

interface RequestFormProps {
  employeeId: number | null;
  requestTypes: RequestType[];
  leaveTypes: LeaveType[];
  loading: boolean;
  onSubmit: (payload: CreateLeaveRequest) => Promise<void>;
}

interface RequestFormState {
  requestTypeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  session: LeaveSession;
  reason: string;
  attachment: string;
}

const emptyForm: RequestFormState = {
  requestTypeId: "",
  leaveTypeId: "",
  startDate: "",
  endDate: "",
  session: "FULL",
  reason: "",
  attachment: "",
};

export function RequestForm({
  employeeId,
  requestTypes,
  leaveTypes,
  loading,
  onSubmit,
}: RequestFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const selectedRequestType = requestTypes.find(
    (requestType) => String(requestType.id) === form.requestTypeId,
  );
  const isLeaveRequest =
    selectedRequestType?.handlerKey === "leave-request" ||
    selectedRequestType?.code === "LEAVE_REQUEST";

  const totalDays = useMemo(
    () => calculateLeaveDays(form.startDate, form.endDate, form.session),
    [form.startDate, form.endDate, form.session],
  );

  const handleSubmit = async () => {
    if (!employeeId) {
      toast.error("Tài khoản chưa liên kết nhân viên");
      return;
    }

    if (!form.requestTypeId) {
      toast.error("Vui lòng chọn loại yêu cầu");
      return;
    }

    if (!isLeaveRequest) {
      toast.error("Loại yêu cầu này chưa hỗ trợ tạo từ màn hình này");
      return;
    }

    if (!form.leaveTypeId) {
      toast.error("Vui lòng chọn loại nghỉ phép");
      return;
    }

    if (!form.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return;
    }

    if (!form.endDate) {
      toast.error("Vui lòng chọn ngày kết thúc");
      return;
    }

    if (form.endDate < form.startDate) {
      toast.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
      return;
    }

    if (form.session !== "FULL" && form.startDate !== form.endDate) {
      toast.error("Nghỉ nửa ngày chỉ áp dụng trong cùng một ngày");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    await onSubmit({
      employeeId,
      leaveTypeId: Number(form.leaveTypeId),
      startDate: form.startDate,
      endDate: form.endDate,
      session: form.session,
      reason: form.reason.trim(),
      attachment: form.attachment.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Thêm yêu cầu mới
            </h2>
          </div>

          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
            <RemainingLeaveBalance />
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/requests/my")}
            >
              <ArrowLeft className="size-4" />
              Quay lại
            </Button>
          </div>
        </div>

        {!employeeId ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 text-sm text-destructive">
              Tài khoản hiện tại chưa có nhân viên liên kết, nên chưa thể tạo
              yêu cầu.
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Thông tin yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Loại yêu cầu</Label>
                <Select
                  value={form.requestTypeId}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      requestTypeId: value,
                      leaveTypeId: "",
                    }))
                  }
                  disabled={!employeeId || loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại yêu cầu" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((requestType) => (
                      <SelectItem
                        key={requestType.id}
                        value={String(requestType.id)}
                      >
                        {requestType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLeaveRequest ? (
                <div className="space-y-2">
                  <Label>Loại nghỉ phép</Label>
                  <Select
                    value={form.leaveTypeId}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, leaveTypeId: value }))
                    }
                    disabled={!employeeId || loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn loại nghỉ phép" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((leaveType) => (
                        <SelectItem
                          key={leaveType.id}
                          value={String(leaveType.id)}
                        >
                          {leaveType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {isLeaveRequest ? (
                <div className="space-y-2">
                  <Label>Thời gian nghỉ</Label>
                  <Select
                    value={form.session}
                    onValueChange={(value: LeaveSession) =>
                      setForm((prev) => ({ ...prev, session: value }))
                    }
                    disabled={!employeeId || loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Cả ngày</SelectItem>
                      <SelectItem
                        value="AM"
                        disabled={Boolean(
                          form.startDate &&
                          form.endDate &&
                          form.startDate !== form.endDate,
                        )}
                      >
                        Buổi sáng
                      </SelectItem>
                      <SelectItem
                        value="PM"
                        disabled={Boolean(
                          form.startDate &&
                          form.endDate &&
                          form.startDate !== form.endDate,
                        )}
                      >
                        Buổi chiều
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="request-total-days">Số ngày dự kiến</Label>
                <Input
                  id="request-total-days"
                  readOnly
                  value={totalDays ? `${totalDays} ngày` : "Chưa chọn ngày"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-start-date">Ngày bắt đầu</Label>
                <Input
                  id="request-start-date"
                  type="date"
                  value={form.startDate}
                  disabled={!employeeId || loading}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                      session:
                        prev.endDate && prev.endDate !== event.target.value
                          ? "FULL"
                          : prev.session,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-end-date">Ngày kết thúc</Label>
                <Input
                  id="request-end-date"
                  type="date"
                  value={form.endDate}
                  disabled={!employeeId || loading}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                      session:
                        prev.startDate && prev.startDate !== event.target.value
                          ? "FULL"
                          : prev.session,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="request-attachment">Tệp đính kèm</Label>
                <Input
                  id="request-attachment"
                  value={form.attachment}
                  disabled={!employeeId || loading}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      attachment: event.target.value,
                    }))
                  }
                  placeholder="Dán đường dẫn tệp nếu có"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="request-reason">Lý do</Label>
                <Textarea
                  id="request-reason"
                  value={form.reason}
                  disabled={!employeeId || loading}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                  placeholder="Nhập lý do gửi yêu cầu"
                  className="min-h-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/requests/my")}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={!employeeId || loading}
            variant="primary"
          >
            <Save className="size-4" />
            {loading ? "Đang lưu..." : "Lưu yêu cầu"}
          </Button>
        </div>
      </div>
    </form>
  );
}
