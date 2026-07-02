import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
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
import { createUser } from "../../services/user.api";
import { useEmployees } from "../../hooks/useEmployees";
import type { Role } from "@/types/role.type";

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
}

export default function UserCreateDialog({
  open,
  onOpenChange,
  roles,
}: UserCreateDialogProps) {
  const queryClient = useQueryClient();
  const { data: employeeResponse, isLoading: isEmployeesLoading } =
    useEmployees({ page: 1, limit: 1000 }, open);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [employeeId, setEmployeeId] = useState("");
  const [roleIds, setRoleIds] = useState<number[]>([]);

  const employees = employeeResponse?.data ?? [];

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Tạo tài khoản thành công");
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message[0]
            : (message ?? "Tạo tài khoản thất bại"),
        );
        return;
      }

      toast.error("Tạo tài khoản thất bại");
    },
  });

  const selectedRoleLabel = useMemo(() => {
    return roleIds.length ? `${roleIds.length} vai trò đã chọn` : "Chưa chọn";
  }, [roleIds]);

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    setRoleIds((current) =>
      checked ? [...current, roleId] : current.filter((id) => id !== roleId),
    );
  };

  const handleSubmit = async () => {
    if (!email || !password || !employeeId || roleIds.length === 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    await createUserMutation.mutateAsync({
      email: email.trim(),
      password,
      status,
      employeeId: Number(employeeId),
      roleIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm tài khoản</DialogTitle>
          <DialogDescription>
            Tạo tài khoản người dùng mới và gán nhân viên, vai trò tương ứng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Mật khẩu</Label>
            <Input
              id="user-password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-status">Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="user-status" className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ kích hoạt</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                <SelectItem value="LOCKED">Đã khóa</SelectItem>
                <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-select">Nhân viên</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger id="employee-select" className="w-full">
                <SelectValue
                  placeholder={
                    isEmployeesLoading
                      ? "Đang tải danh sách nhân viên..."
                      : "Chọn nhân viên"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.fullName} - {employee.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Vai trò</Label>
            <span className="text-xs text-muted-foreground">
              {selectedRoleLabel}
            </span>
          </div>

          <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-2">
            {roles.map((role) => {
              const checked = roleIds.includes(role.id);

              return (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      handleRoleToggle(role.id, value === true)
                    }
                  />
                  <span className="text-sm">{role.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={createUserMutation.isPending}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {createUserMutation.isPending ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
