import { AxiosError } from "axios";
import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useActivateAccount } from "../../hooks/useActivateAccount";

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activateMutation = useActivateAccount();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (localStorage.getItem("accessToken")) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error("Link kích hoạt không hợp lệ hoặc thiếu token");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await activateMutation.mutateAsync({
        token,
        newPassword,
        confirmPassword,
      });

      toast.success("Kích hoạt tài khoản thành công. Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message[0]
            : (message ?? "Kích hoạt tài khoản thất bại"),
        );
        return;
      }

      toast.error("Kích hoạt tài khoản thất bại");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Kích hoạt tài khoản
          </h1>
          <p className="text-sm text-muted-foreground">
            Thiết lập mật khẩu để hoàn tất kích hoạt tài khoản HRM.
          </p>
        </div>

        {!token ? (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Link kích hoạt không hợp lệ. Vui lòng mở lại liên kết trong email.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Quay lại đăng nhập</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={activateMutation.isPending}
              className="w-full bg-teal-500 text-white hover:bg-teal-700"
            >
              {activateMutation.isPending
                ? "Đang kích hoạt..."
                : "Kích hoạt tài khoản"}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
