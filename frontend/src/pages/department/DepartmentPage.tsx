import { useState } from "react";
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
import { useDepartments } from "../../hooks/useDepartments";
import { useEmployees } from "../../hooks/useEmployees";
import {
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from "../../services/department.api";
import type { Department, DepartmentRequest } from "@/types/department.type";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";

type DepartmentMode = "create" | "edit";

function DepartmentFormDialog({
  open,
  onOpenChange,
  mode,
  department,
  onSubmit,
  loading,
  employees,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DepartmentMode;
  department: Department | null;
  onSubmit: (payload: DepartmentRequest) => Promise<void>;
  loading: boolean;
  employees: { id: number; fullName: string; email: string }[];
}) {
  const [code, setCode] = useState(() => department?.code ?? "");
  const [name, setName] = useState(() => department?.name ?? "");
  const [description, setDescription] = useState(
    () => department?.description ?? "",
  );
  const [status, setStatus] = useState(() => department?.status ?? "ACTIVE");
  const [managerId, setManagerId] = useState(() =>
    department?.manager?.id ? String(department.manager.id) : "none",
  );

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error("Vui lòng nhập mã và tên phòng ban");
      return;
    }

    await onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      managerId: managerId === "none" ? undefined : Number(managerId),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm phòng ban" : "Cập nhật phòng ban"}
          </DialogTitle>
          <DialogDescription>Quản lý thông tin phòng ban</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department-code">Mã phòng ban</Label>
            <Input
              id="department-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="HR"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-name">Tên phòng ban</Label>
            <Input
              id="department-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Human Resources"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="department-description">Mô tả</Label>
            <Textarea
              id="department-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phòng ban"
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

          <div className="space-y-2">
            <Label>Trưởng phòng</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.fullName} - {employee.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default function DepartmentPage() {
  const { can } = usePermissionAccess();
  const canCreate = can(PERMISSIONS.DEPARTMENT.CREATE);
  const canUpdate = can(PERMISSIONS.DEPARTMENT.UPDATE);
  const canDelete = can(PERMISSIONS.DEPARTMENT.DELETE);
  const queryClient = useQueryClient();
  const { data: departments = [] } = useDepartments();
  const { data: employeeResponse } = useEmployees(
    { page: 1, limit: 1000 },
    true,
  );

  const employees = employeeResponse?.data ?? [];
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<DepartmentMode>("create");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Tạo phòng ban thành công");
      setOpenDialog(false);
      setSelectedDepartment(null);
    },
    onError: () => toast.error("Tạo phòng ban thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DepartmentRequest }) =>
      updateDepartment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Cập nhật phòng ban thành công");
      setOpenDialog(false);
      setSelectedDepartment(null);
    },
    onError: () => toast.error("Cập nhật phòng ban thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Xóa phòng ban thành công");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Xóa phòng ban thất bại"),
  });

  const handleSubmit = async (payload: DepartmentRequest) => {
    if (mode === "create") {
      await createMutation.mutateAsync(payload);
      return;
    }

    if (!selectedDepartment) return;
    await updateMutation.mutateAsync({ id: selectedDepartment.id, payload });
  };

  const openCreateDialog = () => {
    setMode("create");
    setSelectedDepartment(null);
    setOpenDialog(true);
  };

  const openEditDialog = (department: Department) => {
    setMode("edit");
    setSelectedDepartment(department);
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
            Department Management
          </h1>
          <p className="text-muted-foreground">Quản lý phòng ban</p>
        </div>

        {canCreate ? <Button
          onClick={openCreateDialog}
          className="bg-teal-500 text-white hover:bg-violet-700"
        >
          Thêm phòng ban
        </Button> : null}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trưởng phòng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Chưa có phòng ban nào.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">
                      {department.code}
                    </TableCell>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.description ?? "-"}</TableCell>
                    <TableCell>
                      {department.manager?.fullName ?? "Chưa phân công"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusClass(department.status)}
                      >
                        {department.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate ? <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(department)}
                        >
                          Sửa
                        </Button> : null}

                        {canDelete ? <AlertDialog
                          open={deleteTarget?.id === department.id}
                          onOpenChange={(open) =>
                            !open && setDeleteTarget(null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteTarget(department)}
                            >
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Xóa phòng ban?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này sẽ ẩn phòng ban khỏi danh sách.
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
                        </AlertDialog> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canCreate || canUpdate ? <DepartmentFormDialog
        key={`${openDialog}-${mode}-${selectedDepartment?.id ?? "new"}`}
        open={openDialog}
        onOpenChange={setOpenDialog}
        mode={mode}
        department={selectedDepartment}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        employees={employees}
      /> : null}
    </div>
  );
}
