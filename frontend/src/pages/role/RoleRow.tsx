import { Button } from "../../components/ui/button";
import { TableCell, TableRow } from "../../components/ui/table";
import { Pencil, Trash } from "lucide-react";

export function RoleRow({ role, onEdit, onDelete }) {
  return (
    <TableRow>
      <TableCell>{role.name}</TableCell>

      <TableCell>{role.description}</TableCell>

      <TableCell>{role.permissions.length}</TableCell>

      <TableCell>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(role)}>
            <Pencil />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              onDelete(role);
            }}
          >
            <Trash />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
