import { useState } from "react";
import { Checkbox } from "../../components/ui/checkbox";
import { TableCell, TableRow } from "../../components/ui/table";
import type { Role } from "@/types/role";
interface PermissionRowProps {
  permission: Permission;
  roles: Role[];
  rolePermissions: Map<number, Set<string>>;
  onPermissionChange: (
    roleId: number,
    permissionId: string,
    checked: boolean,
  ) => void;
}
export default function PermissionRow({
  permission,
  roles,
  rolePermissions,
  onPermissionChange,
}: PermissionRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{permission.name}</TableCell>
      {roles.map((role) => {
        const hasPermission =
          rolePermissions.get(role.id)?.has(permission.id) ?? false;

        return (
          <TableCell
            className="text-center"
            key={`${permission.id}-${role.id}`}
          >
            <div className="flex justify-center">
              <Checkbox
                checked={hasPermission}
                onCheckedChange={(checked) => {
                  onPermissionChange(role.id, permission.id, checked === true);
                }}
              />
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}
