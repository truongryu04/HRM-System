import { usePermissions } from "../../hooks/usePermissions";
import { useRoles } from "../../hooks/useRoles";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import PermissionRow from "../permission/PermissionRow";
export function PermissionMatrixTable({
  rolePermissions,
  setRolePermissions,
  disabled = false,
}: {
  rolePermissions: Map<number, Set<string>>;
  setRolePermissions: React.Dispatch<
    React.SetStateAction<Map<number, Set<string>>>
  >;
  disabled?: boolean;
}) {
  const { data: permissions = [] } = usePermissions();
  const { data: roles = [] } = useRoles();
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }

      acc[permission.module].push(permission);

      return acc;
    },
    {} as Record<string, typeof permissions>,
  );
  useEffect(() => {
    const map = new Map<number, Set<string>>();
    roles.forEach((role) => {
      map.set(role.id, new Set(role.permissions.map((p) => p.id)));
    });
    setRolePermissions(map);
  }, [roles, setRolePermissions]);
  const handlePermissionChange = (
    roleId: number,
    permissionId: string,
    checked: boolean,
  ) => {
    console.log("handlePermissionChange", {
      roleId,
      permissionId,
      checked,
    });
    setRolePermissions((prev) => {
      const next = new Map(prev);
      const currentSet = next.get(roleId) || new Set();

      const newSet = new Set(currentSet);

      if (checked) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }

      next.set(roleId, newSet);
      return next;
    });
  };
  return (
    <div className="border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Quyền</TableHead>

              {roles.map((role) => (
                <TableHead
                  key={role.id}
                  className="text-center whitespace-nowrap"
                >
                  {role.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {Object.entries(groupedPermissions).map(
              ([module, modulePermissions]) => (
                <React.Fragment key={module}>
                  {/* Header của module */}
                  <TableRow>
                    <TableCell
                      colSpan={roles.length + 1}
                      className="bg-muted font-semibold uppercase"
                    >
                      {module}
                    </TableCell>
                  </TableRow>
                  {modulePermissions.map((permission) => (
                    <PermissionRow
                      key={permission.id}
                      permission={permission}
                      roles={roles}
                      rolePermissions={rolePermissions}
                      onPermissionChange={handlePermissionChange}
                      disabled={disabled}
                    />
                  ))}
                </React.Fragment>
              ),
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
