import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "../../../components/ui/textarea";
import type { RequestTypeRequest } from "@/types/request-type.type";
import type { RequestTypeMode } from "../request-type.constants";

interface RequestTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RequestTypeMode;
  form: RequestTypeRequest;
  onFormChange: (form: RequestTypeRequest) => void;
  loading: boolean;
  onSubmit: () => Promise<void>;
}

export function RequestTypeDialog({
  open,
  onOpenChange,
  mode,
  form,
  onFormChange,
  loading,
  onSubmit,
}: RequestTypeDialogProps) {
  const updateForm = (payload: Partial<RequestTypeRequest>) => {
    onFormChange({ ...form, ...payload });
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.handlerKey.trim()) {
      toast.error("Vui lòng nhập code, tên loại yêu cầu và handler key");
      return;
    }

    await onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm loại yêu cầu" : "Cập nhật loại yêu cầu"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="request-type-code">Code</Label>
            <Input
              id="request-type-code"
              value={form.code}
              onChange={(event) => updateForm({ code: event.target.value })}
              placeholder="LEAVE_REQUEST"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-type-name">Tên loại yêu cầu</Label>
            <Input
              id="request-type-name"
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              placeholder="Xin nghỉ phép"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-type-handler">Handler key</Label>
            <Input
              id="request-type-handler"
              value={form.handlerKey}
              onChange={(event) =>
                updateForm({ handlerKey: event.target.value })
              }
              placeholder="leave-request"
            />
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={form.isActive.toString()}
              onValueChange={(value) =>
                updateForm({ isActive: value === "true" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="request-type-description">Mô tả</Label>
            <Textarea
              id="request-type-description"
              value={form.description}
              onChange={(event) =>
                updateForm({ description: event.target.value })
              }
              placeholder="Mô tả mục đích sử dụng loại yêu cầu"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
