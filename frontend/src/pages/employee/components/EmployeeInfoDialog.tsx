import { UserRound } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import type { EmployeeSummary } from "@/types/employee.type";
import {
  departmentTagClass,
  employeeStatusBadgeClass,
  positionTagClass,
} from "../employee.constants";
import {
  formatDateOnly,
  genderLabel,
  getInitials,
  statusLabel,
} from "../../../utils/employee.utils";

interface EmployeeInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeSummary | null;
  mode: "detail" | "profile";
}

export function EmployeeInfoDialog({
  open,
  onOpenChange,
  employee,
  mode,
}: EmployeeInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={mode === "profile" ? "max-w-3xl" : "max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>
            {mode === "profile" ? "Hồ sơ nhân viên" : "Chi tiết nhân viên"}
          </DialogTitle>
          <DialogDescription>
            {mode === "profile"
              ? "Thông tin hồ sơ và nhận diện nhanh của nhân viên."
              : "Thông tin chi tiết hiển thị trên danh sách quản lý."}
          </DialogDescription>
        </DialogHeader>

        {employee ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border bg-muted/30 p-4">
              <Avatar size="lg" className="size-14">
                <AvatarImage
                  src={employee.avatarUrl ?? undefined}
                  alt={employee.fullName}
                />
                <AvatarFallback>
                  {getInitials(employee.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{employee.fullName}</h3>
                  <Badge
                    variant="outline"
                    className={employeeStatusBadgeClass[employee.status]}
                  >
                    {statusLabel(employee.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {employee.employeeCode} · {employee.email}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 rounded-xl border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="font-medium">{employee.phone ?? "-"}</p>
              </div>
              <div className="space-y-1 rounded-xl border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Gender
                </p>
                <p className="font-medium">{genderLabel(employee.gender)}</p>
              </div>
              <div className="space-y-1 rounded-xl border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Department
                </p>
                <Badge variant="outline" className={departmentTagClass}>
                  {employee.department.code} - {employee.department.name}
                </Badge>
              </div>
              <div className="space-y-1 rounded-xl border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Position
                </p>
                <Badge variant="outline" className={positionTagClass}>
                  {employee.position.code} - {employee.position.name}
                </Badge>
              </div>
              <div className="space-y-1 rounded-xl border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Join date
                </p>
                <p className="font-medium">
                  {formatDateOnly(employee.joinDate)}
                </p>
              </div>
              <div className="space-y-1 rounded-xl border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <Badge
                  variant="outline"
                  className={employeeStatusBadgeClass[employee.status]}
                >
                  {statusLabel(employee.status)}
                </Badge>
              </div>
            </div>

            {mode === "profile" ? (
              <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <UserRound className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Profile snapshot</p>
                    <p className="text-sm text-muted-foreground">
                      Avatar, department tag và position tag được gom để xem
                      nhanh.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
