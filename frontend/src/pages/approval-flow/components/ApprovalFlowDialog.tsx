import { useState } from "react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { RequestType } from "@/types/request.type";
import type { LeaveType } from "@/types/leave.type";
import type {
  ApprovalFlow,
  CreateApprovalFlowRequest,
} from "@/types/request-config.type";

interface ApprovalFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flow: ApprovalFlow | null;
  requestTypes: RequestType[];
  leaveTypes: LeaveType[];
  leaveTypesLoading: boolean;
  canReadLeaveTypes: boolean;
  loading: boolean;
  onSubmit: (payload: CreateApprovalFlowRequest) => Promise<void>;
}

export function ApprovalFlowDialog({
  open,
  onOpenChange,
  flow,
  requestTypes,
  leaveTypes,
  leaveTypesLoading,
  canReadLeaveTypes,
  loading,
  onSubmit,
}: ApprovalFlowDialogProps) {
  const [name, setName] = useState(flow?.name ?? "");
  const [requestTypeId, setRequestTypeId] = useState(
    flow?.requestType?.id ? String(flow.requestType.id) : "",
  );
  const [subtypeKey, setSubtypeKey] = useState(flow?.subtypeKey ?? "");
  const [isActive, setIsActive] = useState(
    flow ? String(flow.isActive) : "true",
  );
  const [isDefault, setIsDefault] = useState(
    flow ? String(flow.isDefault) : "false",
  );
  const selectedRequestType = requestTypes.find(
    (requestType) => requestType.id === Number(requestTypeId),
  );
  const requiresLeaveType = selectedRequestType?.code === "LEAVE_REQUEST";

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên luồng duyệt");
      return;
    }

    if (!requestTypeId) {
      toast.error("Vui lòng chọn loại request");
      return;
    }

    if (requiresLeaveType && !subtypeKey) {
      toast.error("Vui lòng chọn loại nghỉ phép");
      return;
    }

    const selectedLeaveType = leaveTypes.find(
      (leaveType) => leaveType.id === Number(subtypeKey),
    );

    await onSubmit({
      name: name.trim(),
      requestTypeId: Number(requestTypeId),
      subtypeKey: requiresLeaveType ? subtypeKey : "",
      subtypeLabel: requiresLeaveType ? (selectedLeaveType?.name ?? "") : "",
      isActive: isActive === "true",
      isDefault: isDefault === "true",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {flow ? "Sửa luồng duyệt" : "Thêm luồng duyệt"}
          </DialogTitle>
          <DialogDescription>
            Cấu hình luồng duyệt theo từng loại request.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="approval-flow-name">Tên flow</Label>
            <Input
              id="approval-flow-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nghỉ phép 2 cấp"
            />
          </div>

          <div className="space-y-2">
            <Label>Loại request</Label>
            <Select
              value={requestTypeId}
              onValueChange={(value) => {
                setRequestTypeId(value);
                setSubtypeKey("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại request" />
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

          {requiresLeaveType ? (
            <div className="space-y-2">
              <Label>Loại nghỉ phép</Label>
              <Select
                value={subtypeKey}
                onValueChange={setSubtypeKey}
                disabled={leaveTypesLoading || !canReadLeaveTypes}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      leaveTypesLoading
                        ? "Đang tải loại nghỉ phép..."
                        : "Chọn loại nghỉ phép"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes
                    .filter((leaveType) => leaveType.isActive !== false)
                    .map((leaveType) => (
                      <SelectItem
                        key={leaveType.id}
                        value={String(leaveType.id)}
                      >
                        {leaveType.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {!canReadLeaveTypes ? (
                <p className="text-sm text-destructive">
                  Bạn cần quyền xem loại nghỉ phép để cấu hình luồng này.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mặc định</Label>
              <Select value={isDefault} onValueChange={setIsDefault}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có</SelectItem>
                  <SelectItem value="false">Không</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={loading}
            variant="primary"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
