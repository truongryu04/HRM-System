import { BriefcaseBusiness, PencilLine, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useEmployeeProfile } from "../../hooks/useEmployeeProfile";
import { getInitials, statusLabel } from "../../utils/employee.utils";
import { EmployeeDetailInfoTable } from "../employee/components/EmployeeDetailInfoTable";
import { employeeStatusBadgeClass } from "../employee/employee.constants";

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const { data: employee, isLoading, isError, refetch } = useEmployeeProfile();

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Đang tải hồ sơ cá nhân...</div>;
  }

  if (isError || !employee) {
    return (
      <div className="space-y-4 rounded-xl border p-8 text-center">
        <p className="text-destructive">Không thể tải thông tin nhân viên của tài khoản.</p>
        <Button variant="outline" onClick={() => void refetch()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
          <p className="text-muted-foreground">Thông tin hồ sơ và công việc của bạn.</p>
        </div>
        <Button className="bg-teal-500 text-white hover:bg-teal-700" onClick={() => navigate("/profile/edit")}>
          <PencilLine /> Chỉnh sửa
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-20">
            <AvatarImage src={employee.avatarUrl ?? undefined} alt={employee.fullName} />
            <AvatarFallback>{getInitials(employee.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold">{employee.fullName}</h2>
              <Badge variant="outline" className={employeeStatusBadgeClass[employee.status]}>
                {statusLabel(employee.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{employee.employeeCode} · {employee.email}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="size-4" />{employee.position?.name}</span>
              <span className="inline-flex items-center gap-1"><UserRound className="size-4" />{employee.department?.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Thông tin chi tiết</CardTitle></CardHeader>
        <CardContent><EmployeeDetailInfoTable employee={employee} /></CardContent>
      </Card>
    </div>
  );
}
