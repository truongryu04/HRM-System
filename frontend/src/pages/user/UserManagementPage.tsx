import { useState } from "react";
import { UserTable } from "./UserTable";
import { UserFilterBar } from "./UserFilterBar";
import { useUsers } from "../../hooks/useUsers";
import { useRoles } from "../../hooks/useRoles";
import { Button } from "../../components/ui/button";
import UserCreateDialog from "./UserCreateDialog";

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [linkedEmployee, setLinkedEmployee] = useState("all");
  const { data: roles = [] } = useRoles();

  const handleSearch = (value: string) => {
    setPage(1);
    setSearch(value);
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

        <Button
          onClick={() => setOpenCreateDialog(true)}
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          Thêm tài khoản
        </Button>
      </div>

      <UserFilterBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        role={role}
        setRole={setRole}
        status={status}
        setStatus={setStatus}
        linkedEmployee={linkedEmployee}
        setLinkedEmployee={setLinkedEmployee}
        roles={roles}
      />

      <UserTable
        users={data?.data ?? []}
        page={page}
        totalPages={data?.pagination.totalPages ?? 1}
        setPage={setPage}
      />

      <UserCreateDialog
        key={openCreateDialog ? "open" : "closed"}
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        roles={roles}
      />
    </div>
  );
}
