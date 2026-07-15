import { Navigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import LoginHeader from "./LoginHeader";
import { useAuthStore } from "../../store/auth.store";

export default function LoginPage() {
  const token = useAuthStore((state) => state.accessToken);

  if (token) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <LoginHeader />

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
