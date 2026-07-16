import { useState } from "react";
import { Button } from "../../components/ui/button";
import { RoleTable } from "./RoleTable";
import type { Role } from "../../types/role.type";
import RoleDialog from "./RoleDialog";
import DeleteRoleDialog from "./DeleteRoleDialog";
import { toast } from "sonner";
import { createRole, deleteRole, updateRole } from "../../services/role.api";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../utils/api-error";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";

export default function RolePage() {
  const { can } = usePermissionAccess();
  const canCreate = can(PERMISSIONS.ROLE.CREATE);
  const canEdit = can(PERMISSIONS.ROLE.UPDATE);
  const canDelete = can(PERMISSIONS.ROLE.DELETE);
  const queryClient = useQueryClient();
  const [openRoleDialog, setOpenRoleDialog] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const handleEditClick = (role: Role) => {
    setMode("edit");
    setSelectedRole(role);
    setOpenRoleDialog(true);
  };
  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setOpenDeleteDialog(true);
  };
  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id);
      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });
      toast.success("Xóa vai trò thành công");

      setOpenDeleteDialog(false);
      setSelectedRole(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Xóa vai trò thất bại"));
    }
  };
  const handleSaveRole = async (data: {
    name: string;
    description: string;
  }) => {
    try {
      if (mode === "edit" && selectedRole) {
        await updateRole(selectedRole.id, data);
        await queryClient.invalidateQueries({
          queryKey: ["roles"],
        });
        toast.success("Cập nhật vai trò thành công");
      }
      if (mode === "create") {
        await createRole(data);
        await queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast.success("Tạo vai trò thành công");
      }
      setOpenRoleDialog(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          mode === "create"
            ? "Tạo vai trò thất bại"
            : "Cập nhật vai trò thất bại",
        ),
      );
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>

          <p className="text-muted-foreground">Manage roles in the system.</p>
        </div>
        {canCreate ? <Button
          className="bg-teal-500 text-white hover:bg-teal-700 hover:text-white "
          variant="outline"
          onClick={() => {
            setMode("create");
            setSelectedRole(null);
            setOpenRoleDialog(true);
          }}
        >
          Thêm vai trò
        </Button> : null}
      </div>
      <RoleTable
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        canEdit={canEdit}
        canDelete={canDelete}
      ></RoleTable>
      <RoleDialog
        open={openRoleDialog}
        onOpenChange={setOpenRoleDialog}
        mode={mode}
        role={selectedRole}
        onSubmit={handleSaveRole}
      />
      <DeleteRoleDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        role={selectedRole}
        onConfirm={handleDeleteRole}
      />
    </div>
  );
}
