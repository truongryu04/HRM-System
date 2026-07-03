import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { usePositions } from "../../hooks/usePositions";
import {
  createPosition,
  deletePosition,
  updatePosition,
} from "../../services/position.api";
import type { Position, PositionRequest } from "@/types/position.type";

type PositionMode = "create" | "edit";

function PositionFormDialog({
  open,
  onOpenChange,
  mode,
  position,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PositionMode;
  position: Position | null;
  onSubmit: (payload: PositionRequest) => Promise<void>;
  loading: boolean;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (open && position) {
      setCode(position.code);
      setName(position.name);
      setLevel(position.level ?? "");
      setDescription(position.description ?? "");
      setStatus(position.status ?? "ACTIVE");
      return;
    }

    if (open) {
      setCode("");
      setName("");
      setLevel("");
      setDescription("");
      setStatus("ACTIVE");
    }
  }, [open, position]);

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error("Vui lòng nhập mã và tên vị trí");
      return;
    }

    await onSubmit({
      code: code.trim(),
      name: name.trim(),
      level: level.trim() || undefined,
      description: description.trim() || undefined,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm vị trí" : "Cập nhật vị trí"}
          </DialogTitle>
          <DialogDescription>Quản lý vị trí</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="position-code">Mã vị trí</Label>
            <Input
              id="position-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="DEV"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-name">Tên vị trí</Label>
            <Input
              id="position-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-level">Level</Label>
            <Input
              id="position-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Junior / Senior"
            />
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="position-description">Mô tả</Label>
            <Textarea
              id="position-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả vị trí"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-teal-500 text-white hover:bg-teal-700"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PositionPage() {
  const queryClient = useQueryClient();
  const { data: positions = [] } = usePositions();

  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<PositionMode>("create");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);

  const createMutation = useMutation({
    mutationFn: createPosition,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Tạo vị trí thành công");
      setOpenDialog(false);
      setSelectedPosition(null);
    },
    onError: () => toast.error("Tạo vị trí thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PositionRequest }) =>
      updatePosition(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Cập nhật vị trí thành công");
      setOpenDialog(false);
      setSelectedPosition(null);
    },
    onError: () => toast.error("Cập nhật vị trí thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePosition,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Xóa vị trí thành công");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Xóa vị trí thất bại"),
  });

  const handleSubmit = async (payload: PositionRequest) => {
    if (mode === "create") {
      await createMutation.mutateAsync(payload);
      return;
    }

    if (!selectedPosition) return;
    await updateMutation.mutateAsync({ id: selectedPosition.id, payload });
  };

  const openCreateDialog = () => {
    setMode("create");
    setSelectedPosition(null);
    setOpenDialog(true);
  };

  const openEditDialog = (position: Position) => {
    setMode("edit");
    setSelectedPosition(position);
    setOpenDialog(true);
  };

  const statusClass = (status: string) =>
    status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-700"
      : "bg-slate-500/10 text-slate-700";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Position Management
          </h1>
          <p className="text-muted-foreground">Quản lý vị trí làm việc</p>
        </div>

        <Button
          onClick={openCreateDialog}
          className="bg-teal-500 text-white hover:bg-teal-700"
        >
          Thêm vị trí
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Chưa có vị trí nào.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">
                      {position.code}
                    </TableCell>
                    <TableCell>{position.name}</TableCell>
                    <TableCell>{position.level ?? "-"}</TableCell>
                    <TableCell>{position.description ?? "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusClass(position.status)}
                      >
                        {position.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(position)}
                        >
                          Sửa
                        </Button>

                        <AlertDialog
                          open={deleteTarget?.id === position.id}
                          onOpenChange={(open) =>
                            !open && setDeleteTarget(null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteTarget(position)}
                            >
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa vị trí?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này sẽ ẩn vị trí khỏi danh sách.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate(deleteTarget!.id)
                                }
                              >
                                Xác nhận
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PositionFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        mode={mode}
        position={selectedPosition}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
