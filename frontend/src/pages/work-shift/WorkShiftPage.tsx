import { Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  useCreateWorkShift,
  useDeleteWorkShift,
  useUpdateWorkShift,
  useWorkShifts,
} from "../../hooks/useWorkShifts";
import type { WorkShift, WorkShiftRequest } from "../../types/work-shift.type";
import { getApiErrorMessage } from "../../utils/api-error";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";

const EMPTY_FORM: WorkShiftRequest = {
  name: "",
  startTime: "08:00",
  endTime: "17:00",
  breakStart: "12:00",
  breakEnd: "13:00",
  lateAfter: "08:15",
  standardMinutes: 480,
  isActive: true,
  isDefault: false,
};

function timeValue(value: string | null | undefined) {
  return value?.slice(0, 5) ?? "";
}

function WorkShiftDialog({
  open,
  onOpenChange,
  workShift,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workShift: WorkShift | null;
  loading: boolean;
  onSubmit: (payload: WorkShiftRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<WorkShiftRequest>(() =>
    workShift
      ? {
          name: workShift.name,
          startTime: timeValue(workShift.startTime),
          endTime: timeValue(workShift.endTime),
          breakStart: timeValue(workShift.breakStart),
          breakEnd: timeValue(workShift.breakEnd),
          lateAfter: timeValue(workShift.lateAfter),
          standardMinutes: workShift.standardMinutes,
          isActive: workShift.isActive,
          isDefault: workShift.isDefault,
        }
      : EMPTY_FORM,
  );

  const updateForm = (values: Partial<WorkShiftRequest>) =>
    setForm((current) => ({ ...current, ...values }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên ca làm việc");
    if (!form.startTime || !form.endTime || !form.lateAfter) {
      return toast.error("Vui lòng nhập đầy đủ giờ làm việc");
    }
    if (form.startTime === form.endTime) {
      return toast.error("Giờ bắt đầu và kết thúc không được trùng nhau");
    }
    if (Boolean(form.breakStart) !== Boolean(form.breakEnd)) {
      return toast.error("Vui lòng nhập đầy đủ thời gian nghỉ");
    }
    if (!Number.isInteger(form.standardMinutes) || form.standardMinutes < 1) {
      return toast.error("Số phút công chuẩn phải lớn hơn 0");
    }

    await onSubmit({
      ...form,
      name: form.name.trim(),
      breakStart: form.breakStart || undefined,
      breakEnd: form.breakEnd || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {workShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc"}
            </DialogTitle>
            <DialogDescription>
              Thiết lập khung giờ, thời gian nghỉ và công chuẩn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="shift-name">Tên ca</Label>
              <Input
                id="shift-name"
                value={form.name}
                onChange={(event) => updateForm({ name: event.target.value })}
                placeholder="Ca hành chính"
                autoFocus
              />
            </div>
            {[
              ["startTime", "Giờ bắt đầu"],
              ["endTime", "Giờ kết thúc"],
              ["breakStart", "Bắt đầu nghỉ"],
              ["breakEnd", "Kết thúc nghỉ"],
              ["lateAfter", "Tính đi muộn sau"],
            ].map(([field, label]) => (
              <div className="space-y-2" key={field}>
                <Label htmlFor={field}>{label}</Label>
                <Input
                  id={field}
                  type="time"
                  value={String(form[field as keyof WorkShiftRequest] ?? "")}
                  onChange={(event) =>
                    updateForm({ [field]: event.target.value })
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="standard-minutes">Phút công chuẩn</Label>
              <Input
                id="standard-minutes"
                type="number"
                min={1}
                value={form.standardMinutes}
                onChange={(event) =>
                  updateForm({ standardMinutes: Number(event.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="shift-active"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  updateForm({ isActive: checked === true })
                }
              />
              <Label htmlFor="shift-active">Đang hoạt động</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="shift-default"
                checked={form.isDefault}
                onCheckedChange={(checked) =>
                  updateForm({ isDefault: checked === true })
                }
              />
              <Label htmlFor="shift-default">Đặt làm ca mặc định</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu ca làm việc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function WorkShiftPage() {
  const { can } = usePermissionAccess();
  const canCreate = can(PERMISSIONS.WORK_SHIFT.CREATE);
  const canUpdate = can(PERMISSIONS.WORK_SHIFT.UPDATE);
  const canDelete = can(PERMISSIONS.WORK_SHIFT.DELETE);
  const {
    data: workShifts = [],
    isLoading,
    isError,
    refetch,
  } = useWorkShifts();
  const createMutation = useCreateWorkShift();
  const updateMutation = useUpdateWorkShift();
  const deleteMutation = useDeleteWorkShift();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkShift | null>(null);

  const openCreate = () => {
    setEditingShift(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload: WorkShiftRequest) => {
    try {
      if (editingShift) {
        await updateMutation.mutateAsync({ id: editingShift.id, payload });
        toast.success("Cập nhật ca làm việc thành công");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Tạo ca làm việc thành công");
      }
      setDialogOpen(false);
      setEditingShift(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể lưu ca làm việc"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Xóa ca làm việc thành công");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể xóa ca làm việc"));
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Ca làm việc</h2>
          </div>
          {canCreate ? (
            <Button onClick={openCreate} variant="primary">
              <Plus /> Thêm ca làm việc
            </Button>
          ) : null}
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Đang tải ca làm việc...
              </div>
            ) : isError ? (
              <div className="space-y-3 py-12 text-center">
                <p className="text-destructive">
                  Không thể tải danh sách ca làm việc.
                </p>
                <Button variant="outline" onClick={() => void refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên ca</TableHead>
                      <TableHead>Khung giờ</TableHead>
                      <TableHead>Giờ nghỉ</TableHead>
                      <TableHead>Đi muộn sau</TableHead>
                      <TableHead>Công chuẩn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workShifts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-12 text-center text-muted-foreground"
                        >
                          Chưa có ca làm việc nào.
                        </TableCell>
                      </TableRow>
                    ) : (
                      workShifts.map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Clock3 className="size-4 text-muted-foreground" />
                              {shift.name}
                              {shift.isDefault && (
                                <Badge variant="secondary">Mặc định</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {timeValue(shift.startTime)} –{" "}
                            {timeValue(shift.endTime)}
                          </TableCell>
                          <TableCell>
                            {shift.breakStart && shift.breakEnd
                              ? `${timeValue(shift.breakStart)} – ${timeValue(shift.breakEnd)}`
                              : "Không có"}
                          </TableCell>
                          <TableCell>{timeValue(shift.lateAfter)}</TableCell>
                          <TableCell>{shift.standardMinutes} phút</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                shift.isActive
                                  ? "border-green-200 bg-green-100 text-green-700 hover:bg-green-100"
                                  : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100"
                              }
                            >
                              {shift.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate ? (
                                <Button
                                  size="icon-sm"
                                  variant="primary"
                                  aria-label={`Sửa ${shift.name}`}
                                  onClick={() => {
                                    setEditingShift(shift);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Pencil />
                                </Button>
                              ) : null}
                              {canDelete ? (
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  aria-label={`Xóa ${shift.name}`}
                                  disabled={shift.isDefault}
                                  onClick={() => setDeleteTarget(shift)}
                                >
                                  <Trash2 />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {canCreate || canUpdate ? (
          <WorkShiftDialog
            key={`${dialogOpen}-${editingShift?.id ?? "new"}`}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            workShift={editingShift}
            loading={createMutation.isPending || updateMutation.isPending}
            onSubmit={handleSubmit}
          />
        ) : null}
        {canDelete ? (
          <AlertDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa ca làm việc?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ca “{deleteTarget?.name}” sẽ bị xóa vĩnh viễn. Không thể xóa
                  ca đang được gán cho nhân viên.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleDelete();
                  }}
                >
                  {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </Card>
  );
}
