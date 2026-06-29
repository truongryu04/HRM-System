import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent } from "../../components/ui/card";
import { useRoles } from "../../hooks/useRoles";
import { RoleRow } from "./RoleRow";
export function RoleTable({ onEdit, onDelete }) {
  const { data: roles = [] } = useRoles();
  return (
    <Card>
      <CardContent>
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
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
