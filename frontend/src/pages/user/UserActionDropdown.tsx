// UserActionDropdown.tsx

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import { Button } from "../../components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { User } from "@/types/user.type";
interface UserActionDropdownProps {
  user: User;
  onEdit: (user: User) => void;
}
export default function UserActionDropdown({
  user,
  onEdit,
}: UserActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>Sửa</DropdownMenuItem>

        <DropdownMenuItem>Đặt lại mật khẩu</DropdownMenuItem>

        <DropdownMenuItem>Khóa tài khoản</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
