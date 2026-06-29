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
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
export function Header() {
  const navigate = useNavigate();
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="font-semibold text-base">HRM System</h1>

      <div className="flex items-center gap-4">
        <Button size="icon">
          <Bell />
        </Button>
        <Button size="icon">
          <Settings />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* <Button size="icon">
              <User />
            </Button> */}
            <Button className="flex items-center gap-2">
              {/* <Avatar className="h-8 w-8">
                <AvatarFallback>TN</AvatarFallback>
              </Avatar> */}
              <User />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem>Thông tin cá nhân</DropdownMenuItem>

            <DropdownMenuItem>Đổi mật khẩu</DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/login")}>
              Đăng nhập
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
