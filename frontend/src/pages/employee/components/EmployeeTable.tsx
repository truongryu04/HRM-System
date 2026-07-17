import { Eye, MoreHorizontal, ShieldCheck } from "lucide-react";

import { Button } from "../../../components/ui/button";
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
import { employeeStatusBadgeClass } from "../employee.constants";
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
    <div className="min-w-0 [&_[data-slot=table-container]]:overflow-x-hidden">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[55%] sm:w-[35%] md:w-[28%] lg:w-[22%] xl:w-[20%] 2xl:w-[18%]">
              Nhân viên
            </TableHead>
            <TableHead className="hidden sm:table-cell sm:w-[35%] md:w-[27%] lg:w-[22%] xl:w-[20%] 2xl:w-[17%]">
              Email
            </TableHead>
            <TableHead className="hidden 2xl:table-cell">Phone</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead className="hidden lg:table-cell">Position</TableHead>
            <TableHead className="hidden 2xl:table-cell">Gender</TableHead>
            <TableHead className="hidden xl:table-cell">Join date</TableHead>
            <TableHead className="w-[35%] sm:w-[22%] md:w-[18%] lg:w-[15%]">
              Status
            </TableHead>
            <TableHead className="w-[10%] text-right sm:w-[8%] md:w-[7%] lg:w-[6%]">
              Actions
            </TableHead>
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
                <TableCell className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="shrink-0">
                      <AvatarImage
                        src={employee.avatarUrl ?? undefined}
                        alt={employee.fullName}
                      />
                      <AvatarFallback>
                        {getInitials(employee.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div
                        className="truncate font-medium leading-tight"
                        title={employee.fullName}
                      >
                        {employee.fullName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {employee.employeeCode}
                      </div>
                      <div
                        className="truncate text-xs text-muted-foreground sm:hidden"
                        title={employee.email}
                      >
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden min-w-0 sm:table-cell">
                  <div className="truncate" title={employee.email}>
                    {employee.email}
                  </div>
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  {employee.phone ?? "-"}
                </TableCell>
                <TableCell className="hidden min-w-0 md:table-cell">
                  <div
                    className="truncate"
                    title={`${employee.department.code} - ${employee.department.name}`}
                  >
                    {employee.department.code}
                  </div>
                </TableCell>
                <TableCell className="hidden min-w-0 lg:table-cell">
                  <div
                    className="truncate"
                    title={`${employee.position.code} - ${employee.position.name}`}
                  >
                    {employee.position.code}
                  </div>
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  {genderLabel(employee.gender)}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {formatDateOnly(employee.joinDate)}
                </TableCell>
                <TableCell className="overflow-hidden">
                  <Badge
                    variant="outline"
                    className={`max-w-full ${employeeStatusBadgeClass[employee.status]}`}
                  >
                    <span className="truncate">
                      {statusLabel(employee.status)}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell className="overflow-hidden text-right">
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
                      {canChangeStatus ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            onChangeStatus(employee);
                          }}
                        >
                          <ShieldCheck className="size-4" />
                          Đổi trạng thái
                        </DropdownMenuItem>
                      ) : null}
                      {canDelete ? (
                        <EmployeeActionItem
                          label="Xóa mềm"
                          destructive
                          onClick={() => onDelete(employee)}
                        />
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
