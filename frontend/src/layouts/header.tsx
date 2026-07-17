import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Bell, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../services/auth.api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useEmployeeProfile } from "../hooks/useEmployeeProfile";
import { useAuthStore } from "../store/auth.store";

export function Header() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      clearAuth();
      navigate("/login");
    }
  };
  const { data: employee } = useEmployeeProfile(Boolean(token));
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="font-semibold text-base">HRM System</h1>

      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="ghost"
          className="text-primary hover:text-primary-foreground"
        >
          <Bell className="size-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-primary hover:text-primary-foreground"
        >
          <Settings className="size-5 " />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Mở menu tài khoản"
              className="rounded-full"
            >
              <Avatar className="size-9">
                <AvatarImage
                  src={employee?.avatarUrl ?? undefined}
                  alt={employee?.fullName ?? "Tài khoản"}
                />
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Thông tin cá nhân
            </DropdownMenuItem>

            <DropdownMenuItem>Đổi mật khẩu</DropdownMenuItem>

            <DropdownMenuSeparator />

            {token ? (
              <DropdownMenuItem onClick={handleLogout}>
                Đăng xuất
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate("/login")}>
                Đăng nhập
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
