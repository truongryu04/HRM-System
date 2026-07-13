import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import type { BusinessRequest } from "@/types/request.type";

interface ApprovalActionDialogProps {
  actionRequest: BusinessRequest | null;
  actionType: "approve" | "reject" | null;
  note: string;
  isSubmitting: boolean;
  onNoteChange: (note: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ApprovalActionDialog({
  actionRequest,
  actionType,
  note,
  isSubmitting,
  onNoteChange,
  onClose,
  onSubmit,
}: ApprovalActionDialogProps) {
  return (
    <Dialog open={Boolean(actionRequest)} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "approve" ? "Duyệt yêu cầu" : "Từ chối yêu cầu"}
          </DialogTitle>
          <DialogDescription>
            {actionRequest?.code} - {actionRequest?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="approval-note">
            {actionType === "approve" ? "Ghi chú" : "Lý do từ chối"}
          </label>
          <Textarea
            id="approval-note"
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
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
            onClick={onClose}
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
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {actionType === "approve" ? "Duyệt" : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
