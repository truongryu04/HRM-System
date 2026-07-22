import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toDateTimeLocalValue } from "../../utils/toDateTimeLocalValue";

import type { Attendance } from "../../types/attendance.type";
import { toast } from "sonner";
interface AttendanceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  attendance: Attendance | null;

  onSubmit: (data: {
    checkInTime: string | null;
    checkOutTime: string | null;
    note: string | null;
  }) => Promise<void>;
}

export function AttendanceEditDialog({
  open,
  onOpenChange,
  attendance,
  onSubmit,
}: AttendanceEditDialogProps) {
  const [checkInTime, setCheckInTime] = useState(() =>
    attendance ? toDateTimeLocalValue(attendance.checkInTime) : "",
  );

  const [checkOutTime, setCheckOutTime] = useState(() =>
    attendance ? toDateTimeLocalValue(attendance.checkOutTime) : "",
  );

  const [note, setNote] = useState(() => attendance?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (checkInTime && checkOutTime && checkOutTime < checkInTime) {
      toast.error("Giờ ra phải sau hoặc bằng giờ vào");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        note: note.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-0 overflow-x-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chấm công</DialogTitle>
        </DialogHeader>

        <div className="min-w-0 space-y-4">
          <div className="min-w-0">
            <Label>Nhân viên</Label>

            <Input
              readOnly
              value={`${attendance?.employee?.employeeCode ?? ""} - ${attendance?.employee?.fullName ?? ""}`}
            />
          </div>

          <div>
            <Label>Ngày chấm công</Label>

            <Input readOnly value={attendance?.attendanceDate ?? ""} />
          </div>

          <div className="min-w-0">
            <Label>Giờ vào</Label>

            <Input
              type="datetime-local"
              className="max-w-full min-w-0"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <Label>Giờ ra</Label>

            <Input
              type="datetime-local"
              className="max-w-full min-w-0"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
            />
          </div>

          <div>
            <Label>Ghi chú</Label>

            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
