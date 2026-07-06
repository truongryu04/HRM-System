import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

import { useDepartments } from "../../hooks/useDepartments";
import {
  useEmployees,
  useUpdateEmployeeStatus,
} from "../../hooks/useEmployees";
import { usePositions } from "../../hooks/usePositions";

import { deleteEmployee } from "../../services/employee.api";

import type { EmployeeStatus, EmployeeSummary } from "@/types/employee.type";

import { employeePageSize } from "./employee.constants";
import { EmployeeFilters as EmployeeFilterBar } from "./components/EmployeeFilterBar";
import { EmployeeDeleteDialog } from "./components/EmployeeDeleteDialog";
import { EmployeeStatusDialog } from "./components/EmployeeStatusDialog";
import { EmployeeTable } from "./components/EmployeeTable";
import { normalizeDateKey } from "../../utils/employee.utils";
import { Pagination } from "../../components/Pagination";

export default function EmployeePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();

  const { data: employeeResponse, isLoading } = useEmployees({
    page: 1,
    limit: 1000,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [positionId, setPositionId] = useState("all");
  const [status, setStatus] = useState("all");
  const [gender, setGender] = useState("all");
  const [joinDateFrom, setJoinDateFrom] = useState("");
  const [joinDateTo, setJoinDateTo] = useState("");

  const [employeeToDelete, setEmployeeToDelete] =
    useState<EmployeeSummary | null>(null);

  const employees = useMemo(
    () => employeeResponse?.data ?? [],
    [employeeResponse],
  );

  // ================= DELETE =================
  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Đã xóa mềm nhân viên");
      setEmployeeToDelete(null);
    },
    onError: () => toast.error("Xóa nhân viên thất bại"),
  });

  const handleDeleteSubmit = async () => {
    if (!employeeToDelete) return;
    await deleteMutation.mutateAsync(employeeToDelete.id);
  };

  // ================= STATUS UPDATE =================
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSummary | null>(null);

  const updateStatusMutation = useUpdateEmployeeStatus();
  const handleUpdateStatus = async (status: EmployeeStatus) => {
    if (!selectedEmployee) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedEmployee.id,
        status,
      });

      toast.success("Cập nhật trạng thái thành công");

      setStatusDialogOpen(false);
      setSelectedEmployee(null);
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };
  // ================= FILTER =================
  const handleSearch = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  const handleResetFilters = () => {
    setPage(1);
    setSearchInput("");
    setSearch("");
    setDepartmentId("all");
    setPositionId("all");
    setStatus("all");
    setGender("all");
    setJoinDateFrom("");
    setJoinDateTo("");
  };

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          employee.employeeCode,
          employee.fullName,
          employee.email,
          employee.phone ?? "",
        ]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(normalizedSearch));

      const matchesDepartment =
        departmentId === "all" ||
        String(employee.department.id) === departmentId;

      const matchesPosition =
        positionId === "all" || String(employee.position.id) === positionId;

      const matchesStatus = status === "all" || employee.status === status;

      const matchesGender = gender === "all" || employee.gender === gender;

      const employeeJoinDate = normalizeDateKey(employee.joinDate);

      const matchesJoinDateFrom =
        !joinDateFrom || employeeJoinDate >= joinDateFrom;

      const matchesJoinDateTo = !joinDateTo || employeeJoinDate <= joinDateTo;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        matchesStatus &&
        matchesGender &&
        matchesJoinDateFrom &&
        matchesJoinDateTo
      );
    });
  }, [
    employees,
    search,
    departmentId,
    positionId,
    status,
    gender,
    joinDateFrom,
    joinDateTo,
  ]);

  // ================= PAGINATION =================
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / employeePageSize),
  );

  const currentPage = Math.min(page, totalPages);

  const pagedEmployees = filteredEmployees.slice(
    (currentPage - 1) * employeePageSize,
    currentPage * employeePageSize,
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý nhân viên
          </h1>
          <p className="text-muted-foreground">
            Danh sách nhân viên, bộ lọc, phân trang và thao tác CRUD.
          </p>
        </div>

        <Button
          onClick={() => navigate(`/employees/create`)}
          className="bg-teal-500 hover:bg-teal-700 text-white"
        >
          <Plus />
          Thêm nhân viên
        </Button>
      </div>

      <EmployeeFilterBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        departmentId={departmentId}
        setDepartmentId={(v: string) => {
          setPage(1);
          setDepartmentId(v);
        }}
        positionId={positionId}
        setPositionId={(v: string) => {
          setPage(1);
          setPositionId(v);
        }}
        status={status}
        setStatus={(v: string) => {
          setPage(1);
          setStatus(v);
        }}
        gender={gender}
        setGender={(v: string) => {
          setPage(1);
          setGender(v);
        }}
        joinDateFrom={joinDateFrom}
        setJoinDateFrom={(v: string) => {
          setPage(1);
          setJoinDateFrom(v);
        }}
        joinDateTo={joinDateTo}
        setJoinDateTo={(v: string) => {
          setPage(1);
          setJoinDateTo(v);
        }}
        departments={departments}
        positions={positions}
        onReset={handleResetFilters}
      />

      <Card>
        <CardContent className="pt-6">
          <EmployeeTable
            employees={pagedEmployees}
            onViewDetail={(e) => navigate(`/employees/${e.id}`)}
            onChangeStatus={(employee) => {
              setSelectedEmployee(employee);
              setStatusDialogOpen(true);
            }}
            onDelete={setEmployeeToDelete}
          />
        </CardContent>
      </Card>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={filteredEmployees.length}
        pageSize={employeePageSize}
        setPage={setPage}
        itemName="nhân viên"
      />

      <EmployeeStatusDialog
        key={selectedEmployee?.id}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        employee={selectedEmployee}
        onSubmit={handleUpdateStatus}
        loading={updateStatusMutation.isPending}
      />

      <EmployeeDeleteDialog
        open={Boolean(employeeToDelete)}
        onOpenChange={(open) => {
          if (!open) setEmployeeToDelete(null);
        }}
        employee={employeeToDelete}
        onSubmit={handleDeleteSubmit}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
