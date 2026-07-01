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

import { Button } from "../../components/ui/button";
import UserActionDropdown from "./UserActionDropdown";
import type { User } from "@/types/user.type";

interface UserTableProps {
  users: User[];
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
}

export function UserTable({ users, page, totalPages, setPage }: UserTableProps) {
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

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

      {/* Pagination */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setPage(page - 1)}
          disabled={!canGoPrev}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={!canGoNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
