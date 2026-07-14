import { KeyRound } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import type { User } from "../../types/user.type";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  loading: boolean;
  onConfirm: () => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  users,
  loading,
  onConfirm,
}: ResetPasswordDialogProps) {
  const isBulk = users.length > 1;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <KeyRound />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isBulk
              ? `Đặt lại mật khẩu cho ${users.length} tài khoản?`
              : "Đặt lại mật khẩu tài khoản?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hệ thống sẽ gửi liên kết đặt lại mật khẩu đến email của
            {isBulk ? " các tài khoản đã chọn." : ` ${users[0]?.email ?? "tài khoản này"}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi liên kết"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
