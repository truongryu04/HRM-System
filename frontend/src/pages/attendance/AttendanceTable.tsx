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
    return <Badge>Đang làm việc</Badge>;
  }

  if (isLate) {
    return <Badge variant="secondary">Đi muộn</Badge>;
  }

  return <Badge>Có mặt</Badge>;
}

export function AttendanceTable({
  data,
  setSelectedAttendance,
  setOpenEditDialog,
}: AttendanceTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
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
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
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

                  <TableCell>
                    {item.employee.department?.name ?? "--"}
                  </TableCell>
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

                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedAttendance(item);
                        setOpenEditDialog(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
