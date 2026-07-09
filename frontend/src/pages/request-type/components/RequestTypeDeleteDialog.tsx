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
import type { RequestType } from "@/types/request-type.type";

interface RequestTypeDeleteDialogProps {
  requestType: RequestType | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RequestTypeDeleteDialog({
  requestType,
  loading,
  onOpenChange,
  onConfirm,
}: RequestTypeDeleteDialogProps) {
  return (
    <AlertDialog open={Boolean(requestType)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa loại yêu cầu?</AlertDialogTitle>
          <AlertDialogDescription>
            Loại yêu cầu "{requestType?.name}" sẽ bị xóa khỏi danh sách
            request_types.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={onConfirm}>
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
