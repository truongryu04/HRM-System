// UserActionDropdown.tsx

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import { Button } from "../../components/ui/button";
import { MoreHorizontal } from "lucide-react";

export default function UserActionDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>

        <DropdownMenuItem>Gán nhân viên</DropdownMenuItem>

        <DropdownMenuItem>Phân quyền</DropdownMenuItem>

        <DropdownMenuItem>Đặt lại mật khẩu</DropdownMenuItem>

        <DropdownMenuItem>Khóa tài khoản</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
