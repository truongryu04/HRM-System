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
import { toast } from "sonner";
import type { Role } from "../../types/role.type";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role: Role | null;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

export default function RoleDialog({
  open,
  onOpenChange,
  mode,
  role,
  onSubmit,
}: RoleDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const handleSubmit = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      toast.error("Vui lòng nhập tên vai trò");
      return;
    }
    if (normalizedName.length < 2) {
      toast.error("Tên vai trò phải có ít nhất 2 ký tự");
      return;
    }

    await onSubmit({ name: normalizedName, description: description.trim() });
  };
  useEffect(() => {
    // Reset the local draft whenever the keyed dialog opens for another role.
    if (mode === "edit" && role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
