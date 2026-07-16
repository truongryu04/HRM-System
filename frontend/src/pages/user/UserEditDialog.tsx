import { useMemo, useState } from "react";
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
import { useEmployees } from "../../hooks/useEmployees";

import type { Role } from "@/types/role.type";
import type { UpdateUserRequest, User } from "@/types/user.type";
import { useUpdateUser } from "../../hooks/useUsers";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  roles: Role[];
}

export default function UserEditDialog({
  open,
  onOpenChange,
  user,
  roles,
}: UserEditDialogProps) {
  const { can } = usePermissionAccess();
  const canReadEmployees = can(PERMISSIONS.EMPLOYEE.READ);
  const canAssignRole = can(PERMISSIONS.USER.ASSIGN_ROLE);
  const canUpdateStatus = can(PERMISSIONS.USER.UPDATE_STATUS);
  const updateUserMutation = useUpdateUser();

  const { data: employeeResponse, isLoading: isEmployeesLoading } =
    useEmployees({ page: 1, limit: 1000 }, open && canReadEmployees);

  const employees = employeeResponse?.data ?? [];

  const [email, setEmail] = useState(() => user?.email ?? "");
  const [status, setStatus] = useState(() => user?.status ?? "PENDING");
  const [employeeId, setEmployeeId] = useState(() =>
    String(user?.employee?.id ?? ""),
  );
  const [roleIds, setRoleIds] = useState<number[]>(
    () => user?.roles?.map((role) => role.id) ?? [],
  );

  const selectedRoleLabel = useMemo(() => {
    return roleIds.length ? `${roleIds.length} vai trò đã chọn` : "Chưa chọn";
  }, [roleIds]);

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    setRoleIds((current) =>
      checked ? [...current, roleId] : current.filter((id) => id !== roleId),
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    const payload: UpdateUserRequest = {
      email: email.trim(),
      status,
      employeeId: Number(employeeId),
      roleIds,
    };

    await updateUserMutation.mutateAsync({
      id: user.id,
      payload,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin tài khoản người dùng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-status">Trạng thái</Label>

            <Select
              value={status}
              onValueChange={setStatus}
              disabled={!canUpdateStatus}
            >
              <SelectTrigger id="user-status" className="w-full">
                <SelectValue />
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

            <Select
              value={employeeId}
              onValueChange={setEmployeeId}
              disabled={!canReadEmployees}
            >
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
                    disabled={!canAssignRole}
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
            disabled={updateUserMutation.isPending}
            className="bg-teal-500 text-white hover:bg-teal-700"
          >
            {updateUserMutation.isPending
              ? "Đang cập nhật..."
              : "Cập nhật tài khoản"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
