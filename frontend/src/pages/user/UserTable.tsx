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
import { Badge } from "../../components/ui/badge";

const userStatusMeta: Record<
  string,
  { label: string; className: string; dotClassName: string }
> = {
  ACTIVE: {
    label: "Đang hoạt động",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    dotClassName: "bg-emerald-500",
  },
  PENDING: {
    label: "Chờ kích hoạt",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    dotClassName: "bg-amber-500",
  },
  INACTIVE: {
    label: "Ngừng hoạt động",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dotClassName: "bg-slate-500",
  },
  LOCKED: {
    label: "Đã khóa",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
    dotClassName: "bg-red-500",
  },
  SUSPENDED: {
    label: "Tạm khóa",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
    dotClassName: "bg-violet-500",
  },
};

function UserStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase();
  const meta = userStatusMeta[normalizedStatus];

  if (!meta) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge variant="outline" className={meta.className}>
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${meta.dotClassName}`}
      />
      {meta.label}
    </Badge>
  );
}

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

                <TableCell>
                  <UserStatusBadge status={u.status} />
                </TableCell>

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
