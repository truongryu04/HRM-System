import { Eye, MoreHorizontal, ShieldCheck } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
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

function EmployeeActionItem({
  onClick,
  label,
  destructive = false,
}: {
  onClick: () => void;
  label: string;
  destructive?: boolean;
}) {
  return (
    <DropdownMenuItem
      variant={destructive ? "destructive" : "default"}
      onSelect={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {label}
    </DropdownMenuItem>
  );
}

interface EmployeeTableProps {
  employees: EmployeeSummary[];
  onViewDetail: (employee: EmployeeSummary) => void;
  onChangeStatus: (employee: EmployeeSummary) => void;
  onDelete: (employee: EmployeeSummary) => void;
  canChangeStatus: boolean;
  canDelete: boolean;
}

export function EmployeeTable({
  employees,
  onViewDetail,
  onChangeStatus,
  onDelete,
  canChangeStatus,
  canDelete,
}: EmployeeTableProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Join date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Không có nhân viên phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={employee.avatarUrl ?? undefined}
                            alt={employee.fullName}
                          />
                          <AvatarFallback>
                            {getInitials(employee.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium leading-tight">
                            {employee.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {employee.employeeCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={departmentTagClass}>
                        {employee.department.code} - {employee.department.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={positionTagClass}>
                        {employee.position.code} - {employee.position.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{genderLabel(employee.gender)}</TableCell>
                    <TableCell>{formatDateOnly(employee.joinDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={employeeStatusBadgeClass[employee.status]}
                      >
                        {statusLabel(employee.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Mở menu hành động"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              onViewDetail(employee);
                            }}
                          >
                            <Eye className="size-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {canChangeStatus ? <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              onChangeStatus(employee);
                            }}
                          >
                            <ShieldCheck className="size-4" />
                            Đổi trạng thái
                          </DropdownMenuItem> : null}
                          {canDelete ? <EmployeeActionItem
                            label="Xóa mềm"
                            destructive
                            onClick={() => onDelete(employee)}
                          /> : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
