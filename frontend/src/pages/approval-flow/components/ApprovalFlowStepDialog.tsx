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
import type {
  ApprovalFlowStep,
  ApprovalStepTemplate,
  UpdateApprovalFlowStepFromTemplateRequest,
} from "@/types/request-config.type";
import { getApproverTypeLabel } from "../approval-flow.constants";

interface ApprovalFlowStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: ApprovalFlowStep | null;
  templates: ApprovalStepTemplate[];
  loading: boolean;
  onSubmit: (payload: UpdateApprovalFlowStepFromTemplateRequest) => Promise<void>;
}

export function ApprovalFlowStepDialog({
  open,
  onOpenChange,
  step,
  templates,
  loading,
  onSubmit,
}: ApprovalFlowStepDialogProps) {
  const [templateId, setTemplateId] = useState(
    step?.approvalStepTemplate?.id ? String(step.approvalStepTemplate.id) : "",
  );
  const [stepOrder, setStepOrder] = useState(String(step?.stepOrder ?? 1));

  const handleSubmit = async () => {
    const parsedStepOrder = Number(stepOrder);

    if (!templateId) {
      toast.error("Vui lòng chọn mẫu bước duyệt");
      return;
    }

    if (!Number.isInteger(parsedStepOrder) || parsedStepOrder < 1) {
      toast.error("Thứ tự bước phải là số nguyên lớn hơn 0");
      return;
    }

    await onSubmit({
      templateId: Number(templateId),
      stepOrder: parsedStepOrder,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sửa bước duyệt</DialogTitle>
          <DialogDescription>
            Chọn mẫu bước duyệt mới hoặc đổi thứ tự trong flow hiện tại.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Mẫu bước duyệt</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn mẫu bước" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={String(template.id)}>
                    {template.stepName} -{" "}
                    {getApproverTypeLabel(template.approverType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approval-flow-step-order">Thứ tự trong flow</Label>
            <Input
              id="approval-flow-step-order"
              type="number"
              min={1}
              value={stepOrder}
              onChange={(event) => setStepOrder(event.target.value)}
            />
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
            {loading ? "Đang lưu..." : "Lưu bước"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
