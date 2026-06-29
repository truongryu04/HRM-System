import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
export default function RoleDialog({
  open,
  onOpenChange,
  mode,
  role,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const handleSubmit = async () => {
    await onSubmit({ name, description });
    onOpenChange(false);
  };
  useEffect(() => {
    if (mode === "edit" && role) {
      setName(role.name);
      setDescription(role.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [open, mode, role]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Role" : "Edit Role"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Role name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
