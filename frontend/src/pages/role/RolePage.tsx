import { useState } from "react";
import { Button } from "../../components/ui/button";
import { RoleTable } from "./RoleTable";
import type { Role } from "../../types/role";
import RoleDialog from "./RoleDialog";
import DeleteRoleDialog from "./DeleteRoleDialog";
import { toast } from "sonner";
import { createRole, deleteRole, updateRole } from "../../services/role.api";
import { useQueryClient } from "@tanstack/react-query";

export default function RolePage() {
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
    console.log("handleDeleteRole", selectedRole);
    if (!selectedRole) return;
    console.log("handleDeleteRole", selectedRole);
    try {
      await deleteRole(selectedRole.id);
      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });
      toast.success("Xóa vai trò thành công");

      setOpenDeleteDialog(false);
      setSelectedRole(null);
    } catch (error) {
      toast.error("Xóa vai trò thất bại");
      console.error(error);
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
        toast.success("Tạo vai trò thành công");
      }
      setOpenRoleDialog(false);
    } catch (error) {
      toast.error("Cập nhật vai trò thất bại");
      console.error(error);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>

          <p className="text-muted-foreground">Manage roles in the system.</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          variant="outline"
          onClick={() => {
            setMode("create");
            setSelectedRole(null);
            setOpenRoleDialog(true);
          }}
        >
          Thêm vai trò
        </Button>
      </div>
      <RoleTable
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
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
