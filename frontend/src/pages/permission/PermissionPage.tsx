import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
export default function PermissionList() {
  const [rolePermissions, setRolePermissions] = useState<
    Map<number, Set<string>>
  >(new Map());
  const handleSave = async () => {
    const payload = [];

    rolePermissions.forEach((permissions, roleId) => {
      payload.push({
        roleId,
        permissionIds: [...permissions],
      });
    });
    try {
      await updateRolePermissions(payload);

      toast.success("Cập nhật phân quyền thành công");
    } catch (error) {
      toast.error("Cập nhật phân quyền thất bại");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Permission Management
          </h1>

          <p className="text-muted-foreground">
            Manage role permissions in the system.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              variant="outline"
            >
              Lưu
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận cập nhật phân quyền?</AlertDialogTitle>

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
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>

        <CardContent>
          <PermissionMatrixTable
            rolePermissions={rolePermissions}
            setRolePermissions={setRolePermissions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
