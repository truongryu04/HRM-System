import { useState } from "react";
import { UserTable } from "./UserTable";
import { UserFilterBar } from "./UserFilterBar";
import { useResetUserPasswords, useUsers } from "../../hooks/useUsers";
import { useRoles } from "../../hooks/useRoles";
import { Button } from "../../components/ui/button";
import UserCreateDialog from "./UserCreateDialog";
import { Pagination } from "../../components/Pagination";
import type { User } from "@/types/user.type";
import UserEditDialog from "./UserEditDialog";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../utils/api-error";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [linkedEmployee, setLinkedEmployee] = useState("all");
  const { data: roles = [] } = useRoles();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [resetTargets, setResetTargets] = useState<User[]>([]);
  const resetPasswordMutation = useResetUserPasswords();

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };
  const handleSearch = (value: string) => {
    setPage(1);
    setSearch(value);
    setSelectedUserIds(new Set());
  };

  const changeFilter = (
    setter: (value: string) => void,
    value: string,
  ) => {
    setter(value);
    setPage(1);
    setSelectedUserIds(new Set());
  };

  const normalizedLinkedEmployee =
    linkedEmployee === "all"
      ? undefined
      : linkedEmployee === "linked"
        ? "true"
        : "false";

  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    search,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
    linkedEmployee: normalizedLinkedEmployee,
  });
  const pagination = data?.pagination;
  const users = data?.data ?? [];

  const openSingleReset = (user: User) => setResetTargets([user]);
  const openBulkReset = () => {
    const selectedUsers = users.filter((user) => selectedUserIds.has(user.id));
    if (selectedUsers.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài khoản trên trang hiện tại");
      return;
    }
    setResetTargets(selectedUsers);
  };

  const handleResetPasswords = async () => {
    try {
      const result = await resetPasswordMutation.mutateAsync(
        resetTargets.map((user) => user.id),
      );
      if (result.failed > 0) {
        toast.warning(
          `Đã gửi ${result.queued}/${result.total} liên kết đặt lại mật khẩu`,
        );
      } else {
        toast.success(
          `Đã gửi liên kết đặt lại mật khẩu cho ${result.queued} tài khoản`,
        );
      }
      setSelectedUserIds(new Set());
      setResetTargets([]);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể gửi liên kết đặt lại mật khẩu"),
      );
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản, phân quyền và trạng thái đăng nhập.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {selectedUserIds.size > 0 && (
            <Button variant="outline" onClick={openBulkReset}>
              <KeyRound /> Đặt lại mật khẩu ({selectedUserIds.size})
            </Button>
          )}
          <Button
            onClick={() => setOpenCreateDialog(true)}
            className="bg-teal-500 text-white hover:bg-teal-700"
          >
            Thêm tài khoản
          </Button>
        </div>
      </div>

      <UserFilterBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        role={role}
        setRole={(value) => changeFilter(setRole, value)}
        status={status}
        setStatus={(value) => changeFilter(setStatus, value)}
        linkedEmployee={linkedEmployee}
        setLinkedEmployee={(value) => changeFilter(setLinkedEmployee, value)}
        roles={roles}
      />

      <UserTable
        users={users}
        onEdit={handleEditUser}
        onResetPassword={openSingleReset}
        selectedUserIds={selectedUserIds}
        onSelectionChange={setSelectedUserIds}
      />
      <Pagination
        page={pagination?.page ?? 1}
        totalPages={pagination?.totalPages ?? 1}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.limit ?? 10}
        setPage={(nextPage) => {
          setPage(nextPage);
          setSelectedUserIds(new Set());
        }}
        itemName="tài khoản"
      />
      <UserCreateDialog
        key={openCreateDialog ? "open" : "closed"}
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        roles={roles}
      />
      <UserEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        user={selectedUser}
        roles={roles}
      />
      <ResetPasswordDialog
        open={resetTargets.length > 0}
        onOpenChange={(open) => !open && setResetTargets([])}
        users={resetTargets}
        loading={resetPasswordMutation.isPending}
        onConfirm={() => void handleResetPasswords()}
      />
    </div>
  );
}
