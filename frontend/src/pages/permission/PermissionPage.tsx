import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PermissionMatrixTable } from "./PermissionMatrixTable";
import { useState } from "react";
import { updateRolePermissions } from "../../services/role.api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";
import { useQueryClient } from "@tanstack/react-query";
import type { Permission } from "../../types/permission.type";
import PermissionDialog from "./PermissionDialog";
import { updatePermission } from "../../services/permission.api";
import { getApiErrorMessage } from "../../utils/api-error";
export default function PermissionPage() {
  const queryClient = useQueryClient();
  const { can } = usePermissionAccess();
  const canAssignPermission = can(PERMISSIONS.ROLE.ASSIGN_PERMISSION);
  const canEditPermission = can(PERMISSIONS.PERMISSION.UPDATE);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<
    Map<number, Set<string>>
  >(new Map());
  const handleSave = async () => {
    const payload: Array<{ roleId: number; permissionIds: string[] }> = [];

    rolePermissions.forEach((permissions, roleId) => {
      payload.push({
        roleId,
        permissionIds: [...permissions],
      });
    });
    try {
      await updateRolePermissions(payload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roles"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);

      toast.success("Cập nhật phân quyền thành công");
    } catch {
      toast.error("Cập nhật phân quyền thất bại");
    }
  };
  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setOpenPermissionDialog(true);
  };
  const handleUpdatePermission = async (name: string) => {
    if (!selectedPermission) return;

    setIsUpdatingPermission(true);
    try {
      await updatePermission(selectedPermission.id, { name });
      await queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Cập nhật tên permission thành công");
      setOpenPermissionDialog(false);
      setSelectedPermission(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Cập nhật tên permission thất bại"),
      );
    } finally {
      setIsUpdatingPermission(false);
    }
  };
  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Ma trận phân quyền
            </h2>
          </div>
          {canAssignPermission ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="primary">Lưu</Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Xác nhận cập nhật phân quyền?
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    Thao tác này sẽ thay đổi quyền của các role trong hệ thống.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>

                  <AlertDialogAction onClick={handleSave}>
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>

        <PermissionMatrixTable
          rolePermissions={rolePermissions}
          setRolePermissions={setRolePermissions}
          disabled={!canAssignPermission}
          canEditPermission={canEditPermission}
          onEditPermission={handleEditPermission}
        />
        <PermissionDialog
          key={selectedPermission?.id ?? "no-permission"}
          open={openPermissionDialog}
          onOpenChange={(open) => {
            setOpenPermissionDialog(open);
            if (!open) setSelectedPermission(null);
          }}
          permission={selectedPermission}
          loading={isUpdatingPermission}
          onSubmit={handleUpdatePermission}
        />
      </div>
    </Card>
  );
}
