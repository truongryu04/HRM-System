import { useEffect, type ReactNode } from "react";
import { useCurrentSession } from "../hooks/useCurrentSession";
import { useAuthStore } from "../store/auth.store";

export function AuthInitializer({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateSession = useAuthStore((state) => state.updateSession);
  const { data, isPending } = useCurrentSession();

  useEffect(() => {
    if (accessToken && data) {
      updateSession(data.user, data.permissions);
    }
  }, [accessToken, data, updateSession]);

  if (accessToken && isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <p className="text-sm text-muted-foreground">
          Đang đồng bộ thông tin đăng nhập...
        </p>
      </div>
    );
  }

  return children;
}
