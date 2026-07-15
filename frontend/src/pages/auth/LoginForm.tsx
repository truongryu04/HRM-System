import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import ForgotPasswordLink from "./ForgotPasswordLink";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useLogin } from "../../hooks/useLogin";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
      });

      const { user, permissions, access_token, refresh_token } = response.data;

      login(user, permissions, access_token, refresh_token);

      toast.success("Đăng nhập thành công");
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        const errorMessage = Array.isArray(message)
          ? message[0]
          : (message ?? "Đăng nhập thất bại");

        if (errorMessage === "Account is not active") {
          toast.error(
            "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt và đặt mật khẩu.",
          );
          return;
        }

        toast.error(errorMessage);
        return;
      }

      toast.error("Đăng nhập thất bại");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="bg-teal-500 hover:bg-teal-700 text-white w-full"
        variant="outline"
      >
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
      <ForgotPasswordLink />
    </form>
  );
}
