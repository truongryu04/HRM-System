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
import type { RequestType } from "@/types/leave.type";
import type {
  ApprovalFlow,
  CreateApprovalFlowRequest,
} from "@/types/request-config.type";

interface ApprovalFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flow: ApprovalFlow | null;
  requestTypes: RequestType[];
  loading: boolean;
  onSubmit: (payload: CreateApprovalFlowRequest) => Promise<void>;
}

export function ApprovalFlowDialog({
  open,
  onOpenChange,
  flow,
  requestTypes,
  loading,
  onSubmit,
}: ApprovalFlowDialogProps) {
  const [name, setName] = useState(flow?.name ?? "");
  const [requestTypeId, setRequestTypeId] = useState(
    flow?.requestType?.id ? String(flow.requestType.id) : "",
  );
  const [isActive, setIsActive] = useState(
    flow ? String(flow.isActive) : "true",
  );
  const [isDefault, setIsDefault] = useState(
    flow ? String(flow.isDefault) : "false",
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên luồng duyệt");
      return;
    }

    if (!requestTypeId) {
      toast.error("Vui lòng chọn loại request");
      return;
    }

    await onSubmit({
      name: name.trim(),
      requestTypeId: Number(requestTypeId),
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
            <Select value={requestTypeId} onValueChange={setRequestTypeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại request" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((requestType) => (
                  <SelectItem key={requestType.id} value={String(requestType.id)}>
                    {requestType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            className="bg-teal-500 text-white hover:bg-teal-700"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
