import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PencilLine, UserRound } from "lucide-react";

import { Link, useParams, useNavigate } from "react-router-dom";
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

import { EmployeeDetailInfoTable } from "./components/EmployeeDetailInfoTable";

import { useEmployee } from "../../hooks/useEmployees";

import { getInitials, statusLabel } from "../../utils/employee.utils";
import { employeeStatusBadgeClass } from "./employee.constants";

export default function EmployeeDetailPage() {
  const params = useParams();

  const employeeId = Number(params.id);
  const navigate = useNavigate();

  const isValidId = Number.isFinite(employeeId) && employeeId > 0;

  const {
    data: employee,
    isLoading,
    isError,
  } = useEmployee(employeeId, isValidId);
  console.log("employee", employee);
  const normalizedEmployee = employee ?? null;

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link to="/employees">
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>
        </Button>

        <div className="rounded-xl border p-6 text-muted-foreground">
          ID nhân viên không hợp lệ.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link to="/employees">
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>
        </Button>

        <div className="rounded-xl border p-6 text-red-500">
          Không thể tải thông tin nhân viên.
        </div>
      </div>
    );
  }

  if (!normalizedEmployee) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link to="/employees">
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>
        </Button>

        <div className="rounded-xl border p-6 text-muted-foreground">
          Không tìm thấy nhân viên.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button variant="outline" asChild>
            <Link to="/employees">
              <ArrowLeft className="size-4" />
              Quay lại danh sách
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Chi tiết nhân viên
            </h1>

            <p className="text-muted-foreground">
              Thông tin chi tiết của nhân viên.
            </p>
          </div>
        </div>
        <Button
          className="bg-teal-500 text-white hover:bg-teal-700"
          onClick={() => navigate(`/employees/${employeeId}/edit`)}
        >
          <PencilLine className="size-4  " />
          Sửa thông tin
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src={normalizedEmployee.avatarUrl ?? undefined}
                alt={normalizedEmployee.fullName}
              />

              <AvatarFallback>
                {getInitials(normalizedEmployee.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold">
                  {normalizedEmployee.fullName}
                </h2>

                <Badge
                  variant="outline"
                  className={
                    employeeStatusBadgeClass[normalizedEmployee.status] ?? ""
                  }
                >
                  {statusLabel(normalizedEmployee.status)}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {normalizedEmployee.employeeCode} · {normalizedEmployee.email}
              </p>
            </div>

            <UserRound className="size-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
        </CardHeader>

        <CardContent>
          <EmployeeDetailInfoTable employee={normalizedEmployee} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chấm công</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Khu vực dành cho lịch sử chấm công, ca làm việc, tăng ca và trạng
              thái đi làm của nhân viên.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Công việc</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Khu vực dành cho danh sách công việc, KPI, dự án và lịch sử phân
              công trong tương lai.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
