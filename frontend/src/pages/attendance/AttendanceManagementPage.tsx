import { useState } from "react";

import { AttendanceStatsCards } from "./AttendanceStatsCards";
import { AttendanceFilter } from "./AttendanceFilter";
import { AttendanceTable } from "./AttendanceTable";

import {
  useAttendanceDashboard,
  useAttendances,
} from "../../hooks/useAttendance";

import { useDepartments } from "../../hooks/useDepartments";
import { usePositions } from "../../hooks/usePositions";

export default function AttendanceManagementPage() {
  const today = new Date().toISOString().split("T")[0];

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [attendanceDate, setAttendanceDate] = useState(today);

  const [departmentId, setDepartmentId] = useState("all");

  const [positionId, setPositionId] = useState("all");

  const [status, setStatus] = useState("all");

  const { data: dashboard, isLoading: dashboardLoading } =
    useAttendanceDashboard();

  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();

  const { data: attendanceResponse, isLoading } = useAttendances({
    search,
    attendanceDate,
    departmentId: departmentId === "all" ? undefined : Number(departmentId),
    positionId: positionId === "all" ? undefined : Number(positionId),
    status: status === "all" ? undefined : status,
    page: 1,
    limit: 10,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearch("");

    setAttendanceDate(today);

    setDepartmentId("all");
    setPositionId("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý chấm công</h1>

        <p className="text-muted-foreground">
          Theo dõi và quản lý dữ liệu chấm công nhân viên
        </p>
      </div>

      <AttendanceStatsCards data={dashboard} isLoading={dashboardLoading} />

      <AttendanceFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        attendanceDate={attendanceDate}
        setAttendanceDate={setAttendanceDate}
        departmentId={departmentId}
        setDepartmentId={setDepartmentId}
        positionId={positionId}
        setPositionId={setPositionId}
        status={status}
        setStatus={setStatus}
        departments={departments}
        positions={positions}
        onReset={handleReset}
      />

      <AttendanceTable data={attendanceResponse?.data ?? []} />
    </div>
  );
}
