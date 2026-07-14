import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import { getApiErrorMessage } from "../../utils/api-error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync(normalizedEmail);
      setSubmittedEmail(normalizedEmail);
      toast.success("Yêu cầu đặt lại mật khẩu đã được gửi");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể gửi email đặt lại mật khẩu"),
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        {submittedEmail ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
              <Send className="size-5" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Kiểm tra email của bạn
              </h1>
              <p className="text-sm text-muted-foreground">
                Nếu tài khoản <span className="font-medium text-foreground">{submittedEmail}</span>{" "}
                tồn tại, hệ thống đã gửi một liên kết đặt lại mật khẩu.
              </p>
              <p className="text-sm text-muted-foreground">
                Liên kết có thời hạn sử dụng. Hãy kiểm tra cả thư mục spam.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setSubmittedEmail("")}
              >
                Gửi lại hoặc dùng email khác
              </Button>
              <Button asChild className="w-full bg-teal-500 text-white hover:bg-teal-700">
                <Link to="/login">Quay lại đăng nhập</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                <Mail className="size-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quên mật khẩu
              </h1>
              <p className="text-sm text-muted-foreground">
                Nhập email tài khoản để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-teal-500 text-white hover:bg-teal-700"
              >
                {forgotPasswordMutation.isPending
                  ? "Đang gửi email..."
                  : "Gửi liên kết đặt lại mật khẩu"}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm hover:underline"
                >
                  <ArrowLeft className="size-4" /> Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
