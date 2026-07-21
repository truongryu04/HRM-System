import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
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
import { Card } from "../../components/ui/card";
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
import { PERMISSIONS } from "../../constants/permissions";
import { leaveRequestKeys, useLeaveTypes } from "../../hooks/useLeaveRequests";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";
import {
  createLeaveType,
  deactivateLeaveType,
  updateLeaveType,
} from "../../services/leave.api";
import type {
  CreateLeaveTypeRequest,
  LeaveType,
  LeaveTypeCode,
  UpdateLeaveTypeRequest,
} from "../../types/leave.type";
import { getApiErrorMessage } from "../../utils/api-error";

const leaveTypeLabels: Record<LeaveTypeCode, string> = {
  ANNUAL_LEAVE: "Nghỉ phép năm",
  UNPAID_LEAVE: "Nghỉ không lương",
};

type LeaveTypeForm = {
  code: LeaveTypeCode;
  name: string;
  description: string;
  annualQuota: string;
  isActive: boolean;
};

const emptyForm: LeaveTypeForm = {
  code: "ANNUAL_LEAVE",
  name: "",
  description: "",
  annualQuota: "12",
  isActive: true,
};

export default function LeaveTypePage() {
  const queryClient = useQueryClient();
  const { can } = usePermissionAccess();
  const canCreate = can(PERMISSIONS.LEAVE_TYPE.CREATE);
  const canUpdate = can(PERMISSIONS.LEAVE_TYPE.UPDATE);
  const canDelete = can(PERMISSIONS.LEAVE_TYPE.DELETE);
  const {
    data: leaveTypes = [],
    isLoading,
    isError,
    refetch,
  } = useLeaveTypes();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<LeaveType | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<LeaveType | null>(
    null,
  );
  const [form, setForm] = useState<LeaveTypeForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredLeaveTypes = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    if (!keyword) return leaveTypes;
    return leaveTypes.filter((leaveType) =>
      [
        leaveType.name,
        leaveType.description ?? "",
        leaveType.code ? leaveTypeLabels[leaveType.code] : "",
      ].some((value) => value.toLocaleLowerCase("vi").includes(keyword)),
    );
  }, [leaveTypes, search]);

  const unavailableCodes = new Set(
    leaveTypes.flatMap((leaveType) => (leaveType.code ? [leaveType.code] : [])),
  );
  const canAddMore =
    unavailableCodes.size < Object.keys(leaveTypeLabels).length;

  const closeDialog = () => {
    setDialogOpen(false);
    setSelected(null);
    setFormError(null);
  };

  const createMutation = useMutation({
    mutationFn: createLeaveType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leaveRequestKeys.types(),
      });
      toast.success("Đã thêm loại nghỉ phép");
      closeDialog();
    },
    onError: (error) =>
      setFormError(getApiErrorMessage(error, "Không thể thêm loại nghỉ phép.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLeaveTypeRequest;
    }) => updateLeaveType(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leaveRequestKeys.types(),
      });
      toast.success("Đã cập nhật loại nghỉ phép");
      closeDialog();
    },
    onError: (error) =>
      setFormError(
        getApiErrorMessage(error, "Không thể cập nhật loại nghỉ phép."),
      ),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateLeaveType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leaveRequestKeys.types(),
      });
      toast.success("Đã ngừng sử dụng loại nghỉ phép");
      setDeactivateTarget(null);
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Không thể ngừng sử dụng loại nghỉ phép."),
      ),
  });

  const openCreateDialog = () => {
    const firstAvailableCode = (
      Object.keys(leaveTypeLabels) as LeaveTypeCode[]
    ).find((code) => !unavailableCodes.has(code));
    if (!firstAvailableCode) return;
    setSelected(null);
    setForm({
      ...emptyForm,
      code: firstAvailableCode,
      annualQuota: firstAvailableCode === "ANNUAL_LEAVE" ? "12" : "0",
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (leaveType: LeaveType) => {
    setSelected(leaveType);
    setForm({
      code: leaveType.code ?? "ANNUAL_LEAVE",
      name: leaveType.name,
      description: leaveType.description ?? "",
      annualQuota: String(Number(leaveType.annualQuota)),
      isActive: leaveType.isActive !== false,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    if (!name) {
      setFormError("Vui lòng nhập tên loại nghỉ phép.");
      return;
    }

    const quota = Number(form.annualQuota);
    if (
      form.code === "ANNUAL_LEAVE" &&
      (!Number.isFinite(quota) ||
        quota < 0 ||
        quota * 2 !== Math.round(quota * 2))
    ) {
      setFormError("Quota phải là số không âm và tăng theo bước 0,5 ngày.");
      return;
    }

    setFormError(null);
    const commonPayload = {
      name,
      description: form.description.trim(),
      ...(form.code === "ANNUAL_LEAVE" ? { annualQuota: quota } : {}),
    };

    if (selected) {
      updateMutation.mutate({
        id: selected.id,
        payload: { ...commonPayload, isActive: form.isActive },
      });
      return;
    }

    createMutation.mutate({
      ...commonPayload,
      code: form.code,
    } satisfies CreateLeaveTypeRequest);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Quản lý loại nghỉ phép
            </h2>
          </div>
          {canCreate ? (
            <Button
              variant="primary"
              onClick={openCreateDialog}
              disabled={!canAddMore}
              title={
                !canAddMore ? "Đã cấu hình đủ hai loại nghỉ phép" : undefined
              }
            >
              <Plus className="size-4" />
              Thêm loại nghỉ phép
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên hoặc mô tả"
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredLeaveTypes.length} loại nghỉ phép
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Đang tải loại nghỉ phép...
          </div>
        ) : isError ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-destructive">
              Không thể tải danh sách loại nghỉ phép.
            </p>
            <Button variant="outline" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại nghỉ</TableHead>
                  <TableHead>Tên hiển thị</TableHead>
                  <TableHead>Quyền lợi</TableHead>
                  <TableHead>Quota năm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mô tả</TableHead>
                  {canUpdate || canDelete ? (
                    <TableHead className="text-right">Thao tác</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaveTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canUpdate || canDelete ? 7 : 6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {search
                        ? "Không tìm thấy loại nghỉ phép phù hợp."
                        : "Chưa có loại nghỉ phép nào."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaveTypes.map((leaveType) => (
                    <TableRow key={leaveType.id}>
                      <TableCell className="font-medium">
                        {leaveType.code
                          ? leaveTypeLabels[leaveType.code]
                          : "Chưa phân loại"}
                      </TableCell>
                      <TableCell>{leaveType.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline">
                            {leaveType.isPaid ? "Có lương" : "Không lương"}
                          </Badge>
                          <Badge variant="outline">
                            {leaveType.deductFromBalance
                              ? "Trừ số dư"
                              : "Không trừ số dư"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {leaveType.code === "ANNUAL_LEAVE"
                          ? `${Number(leaveType.annualQuota)} ngày`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            leaveType.isActive !== false
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-slate-500/10 text-slate-700"
                          }
                        >
                          {leaveType.isActive !== false
                            ? "Đang dùng"
                            : "Ngừng dùng"}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-56 text-muted-foreground">
                        {leaveType.description || "—"}
                      </TableCell>
                      {canUpdate || canDelete ? (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate ? (
                              <Button
                                size="icon"
                                variant="outline"
                                aria-label={`Sửa ${leaveType.name}`}
                                onClick={() => openEditDialog(leaveType)}
                              >
                                <Edit className="size-4" />
                              </Button>
                            ) : null}
                            {canDelete && leaveType.isActive !== false ? (
                              <Button
                                size="icon"
                                variant="outline"
                                aria-label={`Ngừng sử dụng ${leaveType.name}`}
                                onClick={() => setDeactivateTarget(leaveType)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selected ? "Cập nhật loại nghỉ phép" : "Thêm loại nghỉ phép"}
            </DialogTitle>
            <DialogDescription>
              Hệ thống tự xác định chế độ trả lương và trừ số dư theo loại nghỉ
              được chọn.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-type-code">Loại nghỉ</Label>
              <Select
                value={form.code}
                disabled={Boolean(selected?.code)}
                onValueChange={(value: LeaveTypeCode) =>
                  setForm((current) => ({
                    ...current,
                    code: value,
                    annualQuota: value === "ANNUAL_LEAVE" ? "12" : "0",
                  }))
                }
              >
                <SelectTrigger id="leave-type-code" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(leaveTypeLabels) as LeaveTypeCode[]).map(
                    (code) => (
                      <SelectItem
                        key={code}
                        value={code}
                        disabled={!selected && unavailableCodes.has(code)}
                      >
                        {leaveTypeLabels[code]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-type-name">Tên hiển thị</Label>
              <Input
                id="leave-type-name"
                maxLength={100}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ví dụ: Nghỉ phép năm"
              />
            </div>
            {form.code === "ANNUAL_LEAVE" ? (
              <div className="space-y-2">
                <Label htmlFor="leave-type-quota">
                  Số ngày mặc định (ngày/năm)
                </Label>
                <Input
                  id="leave-type-quota"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.annualQuota}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      annualQuota: event.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Cho phép số nguyên hoặc nửa ngày.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                Nghỉ không lương không có quota và không trừ số dư phép.
              </div>
            )}
            {selected ? (
              <div className="space-y-2">
                <Label htmlFor="leave-type-status">Trạng thái</Label>
                <Select
                  value={form.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      isActive: value === "active",
                    }))
                  }
                >
                  <SelectTrigger id="leave-type-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang sử dụng</SelectItem>
                    <SelectItem value="inactive">Ngừng sử dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="leave-type-description">Mô tả</Label>
              <Textarea
                id="leave-type-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Mô tả ngắn về chính sách áp dụng"
                rows={3}
              />
            </div>
          </div>
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Đang lưu..."
                : selected
                  ? "Lưu thay đổi"
                  : "Thêm loại nghỉ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ngừng sử dụng loại nghỉ phép?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.name} sẽ không còn xuất hiện khi tạo yêu cầu
              mới. Dữ liệu cũ vẫn được giữ nguyên.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deactivateMutation.isPending}
              onClick={() =>
                deactivateTarget &&
                deactivateMutation.mutate(deactivateTarget.id)
              }
            >
              {deactivateMutation.isPending ? "Đang xử lý..." : "Ngừng sử dụng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
