import { useEffect, useState } from "react";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type {
  EmployeeStatus,
  EmployeeSummary,
  EmployeeUpdateRequest,
} from "@/features/employees/types/employee.type";
import { employeeStatusOptions } from "../employee.constants";

interface EmployeeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeSummary | null;
  onSubmit: (payload: EmployeeUpdateRequest) => Promise<void>;
  loading: boolean;
}

export function EmployeeStatusDialog({
  open,
  onOpenChange,
  employee,
  onSubmit,
  loading,
}: EmployeeStatusDialogProps) {
  const [status, setStatus] = useState<EmployeeStatus>("ACTIVE");

  useEffect(() => {
    if (!open || !employee) {
      return;
    }

    setStatus(employee.status);
  }, [employee, open]);

  const handleSubmit = async () => {
    if (!employee) {
      return;
    }

    await onSubmit({ status });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi trạng thái</DialogTitle>
          <DialogDescription>
            Cập nhật nhanh trạng thái của nhân viên {employee?.fullName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as EmployeeStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {employeeStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
