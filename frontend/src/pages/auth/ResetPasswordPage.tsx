import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useResetPassword } from "../../hooks/useResetPassword";
import { getApiErrorMessage } from "../../utils/api-error";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetMutation = useResetPassword();
  const token = searchParams.get("token")?.trim() ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu token");
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
      await resetMutation.mutateAsync({
        token,
        newPassword,
        confirmPassword,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
        ),
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
            <KeyRound className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Đặt lại mật khẩu
          </h1>
          <p className="text-sm text-muted-foreground">
            Nhập mật khẩu mới cho tài khoản HRM của bạn.
          </p>
        </div>

        {!token ? (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-destructive">
              Liên kết không hợp lệ. Vui lòng mở lại liên kết đặt mật khẩu trong
              email.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Quay lại đăng nhập</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="pr-10"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full bg-teal-500 text-white hover:bg-teal-700"
            >
              {resetMutation.isPending
                ? "Đang đặt lại mật khẩu..."
                : "Đặt lại mật khẩu"}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
