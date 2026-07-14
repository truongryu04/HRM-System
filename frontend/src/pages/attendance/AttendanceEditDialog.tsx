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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chấm công</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
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

          <div>
            <Label>Giờ vào</Label>

            <Input
              type="datetime-local"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
            />
          </div>

          <div>
            <Label>Giờ ra</Label>

            <Input
              type="datetime-local"
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
