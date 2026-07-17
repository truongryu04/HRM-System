import { Button } from "../../components/ui/button";
import { TableCell, TableRow } from "../../components/ui/table";
import { Pencil, Trash } from "lucide-react";
import type { Role } from "../../types/role.type";

type RoleRowProps = {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  canEdit: boolean;
  canDelete: boolean;
};

export function RoleRow({
  role,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: RoleRowProps) {
  return (
    <TableRow>
      <TableCell>{role.name}</TableCell>

      <TableCell>{role.description}</TableCell>

      <TableCell>{role.permissions.length}</TableCell>

      <TableCell>
        {canEdit || canDelete ? (
          <div className="flex gap-2">
            {canEdit ? (
              <Button
                variant="primary"
                size="icon"
                onClick={() => onEdit(role)}
              >
                <Pencil />
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  onDelete(role);
                }}
              >
                <Trash />
              </Button>
            ) : null}
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
