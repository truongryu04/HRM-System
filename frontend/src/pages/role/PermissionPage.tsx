import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PermissionMatrixTable } from "../permission/PermissionMatrixTable";
import { useState } from "react";
import { updateRolePermissions } from "../../services/role.api";
import { toast } from "sonner";
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
        <Button variant="outline" onClick={handleSave}>
          Lưu
        </Button>
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
