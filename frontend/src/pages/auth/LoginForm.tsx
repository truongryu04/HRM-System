import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import ForgotPasswordLink from "./ForgotPasswordLink";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useLogin } from "../../hooks/useLogin";
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const authStore = useAuthStore();

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
      });

      const { user, permissions, access_token, refresh_token } = response.data;

      authStore.login(user, permissions, access_token, refresh_token);

      localStorage.setItem("accessToken", access_token);

      localStorage.setItem("refreshToken", refresh_token);

      navigate("/");
    } catch (error) {
      console.error(error);
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
