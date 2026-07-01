import { Button } from "../../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import type { EmployeeSummary } from "@/features/employees/types/employee.type";

interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeSummary | null;
  onSubmit: () => Promise<void>;
  loading: boolean;
}

export function EmployeeDeleteDialog({
  open,
  onOpenChange,
  employee,
  onSubmit,
  loading,
}: EmployeeDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa mềm nhân viên?</AlertDialogTitle>
          <AlertDialogDescription>
            Nhân viên {employee?.fullName} sẽ được đánh dấu đã xóa và không còn
            hiển thị trong danh sách.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Hủy</Button>
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
