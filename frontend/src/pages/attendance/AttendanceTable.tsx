import { Pencil } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import type { Attendance } from "../../types/attendance.type";

interface AttendanceTableProps {
  data: Attendance[];

  setSelectedAttendance: (attendance: Attendance | null) => void;

  setOpenEditDialog: (open: boolean) => void;
  canUpdate: boolean;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatTime = (dateTime?: string | null) => {
  if (!dateTime) return "--";

  return new Date(dateTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatWorkMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  return `${hours}h ${remainMinutes}m`;
};

function StatusBadge({
  isLate,
  checkOutTime,
}: {
  isLate: boolean;
  checkOutTime: string | null;
}) {
  if (!checkOutTime) {
    return (
      <Badge className="border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100">
        Đang làm việc
      </Badge>
    );
  }

  if (isLate) {
    return (
      <Badge className="border-red-200 bg-red-100 text-red-700 hover:bg-red-100">
        Đi muộn
      </Badge>
    );
  }

  return (
    <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
      Có mặt
    </Badge>
  );
}

export function AttendanceTable({
  data,
  setSelectedAttendance,
  setOpenEditDialog,
  canUpdate,
}: AttendanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>STT</TableHead>
          <TableHead>Mã NV</TableHead>
          <TableHead>Nhân viên</TableHead>
          <TableHead>Phòng ban</TableHead>
          <TableHead>Chức vụ</TableHead>
          <TableHead>Ngày</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Giờ làm</TableHead>
          <TableHead>Trạng thái</TableHead>
          {canUpdate ? (
            <TableHead className="text-right">Thao tác</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={canUpdate ? 11 : 10}
              className="text-center py-8"
            >
              Không có dữ liệu
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>

              <TableCell>{item.employee.employeeCode}</TableCell>

              <TableCell className="font-medium">
                {item.employee.fullName}
              </TableCell>

              <TableCell>{item.employee.department?.name ?? "--"}</TableCell>
              <TableCell>{item.employee.position?.name ?? "--"}</TableCell>

              <TableCell>{formatDate(item.attendanceDate)}</TableCell>

              <TableCell>{formatTime(item.checkInTime)}</TableCell>

              <TableCell>{formatTime(item.checkOutTime)}</TableCell>

              <TableCell>{formatWorkMinutes(item.workMinutes)}</TableCell>

              <TableCell>
                <StatusBadge
                  isLate={item.isLate}
                  checkOutTime={item.checkOutTime}
                />
              </TableCell>

              {canUpdate ? (
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="primary"
                    onClick={() => {
                      setSelectedAttendance(item);
                      setOpenEditDialog(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
