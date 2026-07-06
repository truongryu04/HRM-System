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
import { Pagination } from "../../components/Pagination";

export default function AttendanceManagementPage() {
  const today = new Date().toISOString().split("T")[0];

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [date, setDate] = useState(today);

  const [departmentId, setDepartmentId] = useState("all");

  const [positionId, setPositionId] = useState("all");

  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data: dashboard, isLoading: dashboardLoading } =
    useAttendanceDashboard();

  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();

  const { data: attendanceResponse, isLoading } = useAttendances({
    search,
    date: date,
    departmentId: departmentId === "all" ? undefined : Number(departmentId),
    positionId: positionId === "all" ? undefined : Number(positionId),
    status: status === "all" ? undefined : status,
    page,
    limit: 10,
  });
  const meta = attendanceResponse?.meta;
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearch("");

    setDate(today);

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
        date={date}
        setDate={setDate}
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
      <Pagination
        page={meta?.page ?? 1}
        totalPages={meta?.totalPages ?? 1}
        totalItems={meta?.total ?? 0}
        pageSize={meta?.limit ?? 10}
        setPage={setPage}
        itemName="tài khoản"
      />
    </div>
  );
}
