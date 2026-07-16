import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import UserActionDropdown from "./UserActionDropdown";
import type { User } from "@/types/user.type";
import { Checkbox } from "../../components/ui/checkbox";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  selectedUserIds: Set<number>;
  onSelectionChange: (userIds: Set<number>) => void;
  canEdit: boolean;
  canResetPassword: boolean;
}

export function UserTable({
  users,
  onEdit,
  onResetPassword,
  selectedUserIds,
  onSelectionChange,
  canEdit,
  canResetPassword,
}: UserTableProps) {
  const pageUserIds = users.map((user) => user.id);
  const selectedOnPage = pageUserIds.filter((id) => selectedUserIds.has(id));
  const allOnPageSelected =
    pageUserIds.length > 0 && selectedOnPage.length === pageUserIds.length;

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedUserIds);
    pageUserIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    onSelectionChange(next);
  };

  const toggleUser = (userId: number, checked: boolean) => {
    const next = new Set(selectedUserIds);
    if (checked) next.add(userId);
    else next.delete(userId);
    onSelectionChange(next);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {canResetPassword ? <TableHead className="w-10">
              <Checkbox
                aria-label="Chọn tất cả tài khoản trên trang"
                checked={
                  allOnPageSelected ||
                  (selectedOnPage.length > 0 ? "indeterminate" : false)
                }
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
            </TableHead> : null}
            <TableHead>Email</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canResetPassword ? 7 : 6}
                className="py-10 text-center text-muted-foreground"
              >
                Không có người dùng phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id}>
                {canResetPassword ? <TableCell>
                  <Checkbox
                    aria-label={`Chọn tài khoản ${u.email}`}
                    checked={selectedUserIds.has(u.id)}
                    onCheckedChange={(checked) =>
                      toggleUser(u.id, checked === true)
                    }
                  />
                </TableCell> : null}
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.employee?.fullName ?? "Chưa liên kết"}</TableCell>
                <TableCell>{u.roles?.map((r) => r.name).join(", ")}</TableCell>

                <TableCell>{u.status}</TableCell>

                <TableCell>
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleString()
                    : "Chưa đăng nhập"}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <UserActionDropdown
                    user={u}
                    onEdit={onEdit}
                    onResetPassword={onResetPassword}
                    canEdit={canEdit}
                    canResetPassword={canResetPassword}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
