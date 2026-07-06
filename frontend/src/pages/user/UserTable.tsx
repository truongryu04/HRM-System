// components/UserTable.tsx
import type { Dispatch, SetStateAction } from "react";
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

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
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
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                Không có người dùng phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id}>
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
                  <UserActionDropdown />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
