// UserActionDropdown.tsx

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import { Button } from "../../components/ui/button";
import { KeyRound, MoreHorizontal, Pencil } from "lucide-react";
import type { User } from "@/types/user.type";
interface UserActionDropdownProps {
  user: User;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
}
export default function UserActionDropdown({
  user,
  onEdit,
  onResetPassword,
}: UserActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Pencil /> Sửa
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onResetPassword(user)}>
          <KeyRound /> Đặt lại mật khẩu
        </DropdownMenuItem>

        <DropdownMenuItem>Khóa tài khoản</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
