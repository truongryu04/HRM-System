import { useState } from "react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import type { Permission } from "../../types/permission.type";

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
  loading: boolean;
  onSubmit: (name: string) => Promise<void>;
}

export default function PermissionDialog({
  open,
  onOpenChange,
  permission,
  loading,
  onSubmit,
}: PermissionDialogProps) {
  const [name, setName] = useState(permission?.name ?? "");

  const handleSubmit = async () => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Vui lòng nhập tên permission");
      return;
    }

    if (normalizedName.length > 255) {
      toast.error("Tên permission không được vượt quá 255 ký tự");
      return;
    }

    await onSubmit(normalizedName);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa permission</DialogTitle>
          <DialogDescription>
            Chỉ tên hiển thị được phép thay đổi. Mã permission{" "}
            <span className="font-medium text-foreground">
              {permission?.code}
            </span>{" "}
            được giữ nguyên.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="permission-name">Tên permission</Label>
          <Input
            id="permission-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            autoFocus
            disabled={loading}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleSubmit()}
            disabled={loading || !name.trim()}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
