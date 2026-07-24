import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useRoles } from "../../hooks/useRoles";
import { RoleRow } from "./RoleRow";
import type { Role } from "../../types/role.type";

type RoleTableProps = {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  canEdit: boolean;
  canDelete: boolean;
};

export function RoleTable({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: RoleTableProps) {
  const { data: roles = [] } = useRoles();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {roles.map((role) => (
          <RoleRow
            key={role.id}
            role={role}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
