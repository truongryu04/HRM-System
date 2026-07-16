import type { Permission } from "@/types/permission.type";
import { Checkbox } from "../../components/ui/checkbox";
import { TableCell, TableRow } from "../../components/ui/table";
import type { Role } from "@/types/role.type";
interface PermissionRowProps {
  permission: Permission;
  roles: Role[];
  rolePermissions: Map<number, Set<string>>;
  onPermissionChange: (
    roleId: number,
    permissionId: string,
    checked: boolean,
  ) => void;
  disabled?: boolean;
}
export default function PermissionRow({
  permission,
  roles,
  rolePermissions,
  onPermissionChange,
  disabled = false,
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
                disabled={disabled}
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
