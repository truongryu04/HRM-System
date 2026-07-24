import type { Permission } from "@/types/permission.type";
import { Checkbox } from "../../components/ui/checkbox";
import { TableCell, TableRow } from "../../components/ui/table";
import type { Role } from "@/types/role.type";
import { Button } from "../../components/ui/button";
import { Pencil } from "lucide-react";
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
  canEdit: boolean;
  onEdit: (permission: Permission) => void;
}
export default function PermissionRow({
  permission,
  roles,
  rolePermissions,
  onPermissionChange,
  disabled = false,
  canEdit,
  onEdit,
}: PermissionRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center justify-between gap-2">
          <span>{permission.name}</span>
          {canEdit ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Sửa permission ${permission.name}`}
              onClick={() => onEdit(permission)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
        </div>
      </TableCell>
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
