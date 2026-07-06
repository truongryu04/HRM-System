import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
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
  statusLabel,
} from "../../../utils/employee.utils";

interface EmployeeDetailInfoTableProps {
  employee: EmployeeSummary;
}

export function EmployeeDetailInfoTable({
  employee,
}: EmployeeDetailInfoTableProps) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableHead className="w-56">Employee code</TableHead>
          <TableCell>{employee.employeeCode}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Full name</TableHead>
          <TableCell>{employee.fullName}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableCell>{employee.email}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Phone</TableHead>
          <TableCell>{employee.phone ?? "-"}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableCell className="whitespace-normal">
            {employee.address ?? "-"}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Gender</TableHead>
          <TableCell>{genderLabel(employee.gender)}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Date of birth</TableHead>
          <TableCell>{formatDateOnly(employee.dob)}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Join date</TableHead>
          <TableCell>{formatDateOnly(employee.joinDate)}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableCell>
            <Badge
              variant="outline"
              className={employeeStatusBadgeClass[employee.status]}
            >
              {statusLabel(employee.status)}
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Department</TableHead>
          <TableCell>
            <Badge variant="outline" className={departmentTagClass}>
              {employee.department.code} - {employee.department.name}
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Position</TableHead>
          <TableCell>
            <Badge variant="outline" className={positionTagClass}>
              {employee.position.code} - {employee.position.name}
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Accounts</TableHead>
          <TableCell>
            <div className="space-y-2">
              {employee.users?.length
                ? employee.users.map((user) => (
                    <div key={user.id} className="flex flex-col gap-1">
                      <span>{user.email}</span>

                      <div className="flex flex-wrap gap-2">
                        {user.roles?.map((role) => (
                          <Badge key={role.id} variant="secondary">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                : "-"}
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Work shift</TableHead>
          <TableCell>
            {employee.workShift ? (
              <Badge variant="outline">{employee.workShift.name}</Badge>
            ) : (
              "-"
            )}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableHead>Shift time</TableHead>
          <TableCell>
            {employee.workShift
              ? `${employee.workShift.startTime} - ${employee.workShift.endTime}`
              : "-"}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
