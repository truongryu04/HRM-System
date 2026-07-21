import { useMemo, useState } from "react";
import { Check, ChevronDown, FilterX, Search, X } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type {
  EmployeeStatus,
  EmployeeSummary,
} from "../../types/employee.type";
import { cn } from "../../lib/utils";

interface EmployeeSearchComboboxProps {
  employees: EmployeeSummary[];
  value: number | null;
  onChange: (employeeId: number | null) => void;
  loading?: boolean;
  error?: boolean;
}

const MAX_VISIBLE_RESULTS = 50;

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: "Đang làm việc",
  INACTIVE: "Tạm ngưng",
  ON_LEAVE: "Đang nghỉ dài hạn",
  RESIGNED: "Đã nghỉ việc",
  TERMINATED: "Đã chấm dứt",
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi");
}

function getEmployeeLabel(employee: EmployeeSummary) {
  return `${employee.employeeCode} · ${employee.fullName}`;
}

function getStatusClass(status: EmployeeStatus) {
  if (status === "ACTIVE") return "bg-emerald-500/10 text-emerald-700";
  if (status === "ON_LEAVE") return "bg-amber-500/10 text-amber-700";
  if (status === "INACTIVE") return "bg-slate-500/10 text-slate-700";
  return "bg-destructive/10 text-destructive";
}

export function EmployeeSearchCombobox({
  employees,
  value,
  onChange,
  loading = false,
  error = false,
}: EmployeeSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [positionId, setPositionId] = useState("all");
  const [status, setStatus] = useState<"all" | EmployeeStatus>("all");

  const selectedEmployee = employees.find((employee) => employee.id === value);

  const departments = useMemo(
    () =>
      Array.from(
        new Map(
          employees.map((employee) => [employee.department.id, employee.department]),
        ).values(),
      ).sort((left, right) => left.name.localeCompare(right.name, "vi")),
    [employees],
  );

  const positions = useMemo(() => {
    const employeesInDepartment =
      departmentId === "all"
        ? employees
        : employees.filter(
            (employee) => employee.department.id === Number(departmentId),
          );

    return Array.from(
      new Map(
        employeesInDepartment.map((employee) => [
          employee.position.id,
          employee.position,
        ]),
      ).values(),
    ).sort((left, right) => left.name.localeCompare(right.name, "vi"));
  }, [departmentId, employees]);

  const matchingEmployees = useMemo(() => {
    const keyword = normalizeSearchText(search.trim());

    return employees
      .filter((employee) => {
        const matchesKeyword =
          !keyword ||
          normalizeSearchText(
            `${employee.employeeCode} ${employee.fullName} ${employee.email}`,
          ).includes(keyword);
        const matchesDepartment =
          departmentId === "all" ||
          employee.department.id === Number(departmentId);
        const matchesPosition =
          positionId === "all" || employee.position.id === Number(positionId);
        const matchesStatus = status === "all" || employee.status === status;

        return (
          matchesKeyword &&
          matchesDepartment &&
          matchesPosition &&
          matchesStatus
        );
      })
      .sort((left, right) => left.fullName.localeCompare(right.fullName, "vi"));
  }, [departmentId, employees, positionId, search, status]);

  const visibleEmployees = matchingEmployees.slice(0, MAX_VISIBLE_RESULTS);
  const hasFilters =
    Boolean(search.trim()) ||
    departmentId !== "all" ||
    positionId !== "all" ||
    status !== "all";

  const clearFilters = () => {
    setSearch("");
    setDepartmentId("all");
    setPositionId("all");
    setStatus("all");
  };

  const selectEmployee = (employee: EmployeeSummary) => {
    onChange(employee.id);
    setOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          id="balance-employee"
          type="button"
          variant="outline"
          className="h-9 min-w-0 flex-1 justify-between px-3 font-normal"
          disabled={loading || error}
          onClick={() => setOpen(true)}
        >
          <span
            className={cn(
              "truncate text-left",
              !selectedEmployee && "text-muted-foreground",
            )}
          >
            {loading
              ? "Đang tải nhân viên..."
              : error
                ? "Không thể tải nhân viên"
                : selectedEmployee
                  ? getEmployeeLabel(selectedEmployee)
                  : "Tìm và chọn nhân viên"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>

        {selectedEmployee ? (
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Xóa nhân viên đã chọn"
            onClick={() => onChange(null)}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tìm và chọn nhân viên</DialogTitle>
            <DialogDescription>
              Tìm theo mã, họ tên hoặc email; kết hợp bộ lọc để thu hẹp danh sách.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nhập mã nhân viên, họ tên hoặc email"
                className="h-9 pl-9"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <Select
                value={departmentId}
                onValueChange={(nextDepartmentId) => {
                  setDepartmentId(nextDepartmentId);
                  setPositionId("all");
                }}
              >
                <SelectTrigger className="w-full" aria-label="Lọc theo phòng ban">
                  <SelectValue placeholder="Tất cả phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={String(department.id)}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger className="w-full" aria-label="Lọc theo vị trí">
                  <SelectValue placeholder="Tất cả vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vị trí</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={String(position.id)}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(nextStatus: "all" | EmployeeStatus) =>
                  setStatus(nextStatus)
                }
              >
                <SelectTrigger className="w-full" aria-label="Lọc theo trạng thái">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {(Object.keys(statusLabels) as EmployeeStatus[]).map(
                    (employeeStatus) => (
                      <SelectItem key={employeeStatus} value={employeeStatus}>
                        {statusLabels[employeeStatus]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                <FilterX className="size-4" />
                Xóa lọc
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="font-medium">{matchingEmployees.length} nhân viên</p>
              {matchingEmployees.length > MAX_VISIBLE_RESULTS ? (
                <p className="text-xs text-muted-foreground">
                  Hiển thị {MAX_VISIBLE_RESULTS} kết quả đầu tiên
                </p>
              ) : null}
            </div>

            <div
              role="listbox"
              aria-label="Danh sách nhân viên"
              className="max-h-[min(24rem,50vh)] overflow-y-auto rounded-lg border p-1"
            >
              {visibleEmployees.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Search className="mx-auto size-8 text-muted-foreground/60" />
                  <p className="mt-3 font-medium">Không tìm thấy nhân viên</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Thử thay đổi từ khóa hoặc xóa bớt bộ lọc.
                  </p>
                </div>
              ) : (
                visibleEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    role="option"
                    aria-selected={employee.id === value}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                      employee.id === value && "bg-accent",
                    )}
                    onClick={() => selectEmployee(employee)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium">{employee.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {employee.employeeCode}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {employee.email} · {employee.department.name} ·{" "}
                        {employee.position.name}
                      </span>
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", getStatusClass(employee.status))}
                    >
                      {statusLabels[employee.status]}
                    </Badge>
                    {employee.id === value ? (
                      <Check className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
