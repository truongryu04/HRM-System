import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import {
  leaveBalanceKeys,
  useGrantedEmployeeIds,
} from "../../hooks/useLeaveBalances";
import { grantDefaultLeaveBalance } from "../../services/leave-balance.api";
import type { EmployeeSummary } from "../../types/employee.type";
import type { LeaveType } from "../../types/leave.type";
import { getApiErrorMessage } from "../../utils/api-error";

interface GrantDefaultLeaveBalanceDialogProps {
  year: number;
  leaveTypes: LeaveType[];
  employees: EmployeeSummary[];
  employeesLoading: boolean;
  employeesError: boolean;
}

const eligibleStatuses = new Set(["ACTIVE", "INACTIVE", "ON_LEAVE"]);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, index) => currentYear + 1 - index);

export function GrantDefaultLeaveBalanceDialog({
  year,
  leaveTypes,
  employees,
  employeesLoading,
  employeesError,
}: GrantDefaultLeaveBalanceDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [selectedYear, setSelectedYear] = useState(year);
  const [annualGranted, setAnnualGranted] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [positionId, setPositionId] = useState("all");
  const [quotaStatus, setQuotaStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const grantedEmployeeIdsQuery = useGrantedEmployeeIds(
    selectedYear,
    leaveTypeId ? Number(leaveTypeId) : null,
    open,
  );
  const grantedEmployeeIds = useMemo(
    () => new Set(grantedEmployeeIdsQuery.data ?? []),
    [grantedEmployeeIdsQuery.data],
  );

  const eligibleEmployees = useMemo(
    () => employees.filter((employee) => eligibleStatuses.has(employee.status)),
    [employees],
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Map(
          eligibleEmployees.map((employee) => [
            employee.department.id,
            employee.department,
          ]),
        ).values(),
      ).sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [eligibleEmployees],
  );

  const positions = useMemo(
    () =>
      Array.from(
        new Map(
          eligibleEmployees.map((employee) => [
            employee.position.id,
            employee.position,
          ]),
        ).values(),
      ).sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [eligibleEmployees],
  );

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return eligibleEmployees.filter((employee) => {
      const matchesSearch =
        !keyword ||
        employee.fullName.toLocaleLowerCase("vi").includes(keyword) ||
        employee.employeeCode.toLocaleLowerCase("vi").includes(keyword) ||
        employee.email.toLocaleLowerCase("vi").includes(keyword);
      const matchesDepartment =
        departmentId === "all" ||
        employee.department.id === Number(departmentId);
      const matchesPosition =
        positionId === "all" || employee.position.id === Number(positionId);
      const hasQuota = grantedEmployeeIds.has(employee.id);
      const matchesQuotaStatus =
        quotaStatus === "all" ||
        (quotaStatus === "not-granted" ? !hasQuota : hasQuota);
      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        matchesQuotaStatus
      );
    });
  }, [
    departmentId,
    eligibleEmployees,
    grantedEmployeeIds,
    positionId,
    quotaStatus,
    search,
  ]);

  const selectedFilteredCount = filteredEmployees.filter((employee) =>
    selectedIds.has(employee.id),
  ).length;
  const allFilteredSelected =
    filteredEmployees.length > 0 &&
    selectedFilteredCount === filteredEmployees.length;
  const filteredSelectionState = allFilteredSelected
    ? true
    : selectedFilteredCount > 0
      ? "indeterminate"
      : false;

  const mutation = useMutation({
    mutationFn: grantDefaultLeaveBalance,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: leaveBalanceKeys.all });
      const applied = result.created + result.updated;
      const unavailable = result.requestedEmployees - result.totalEmployees;
      const details = [
        `${applied} nhân viên được cập nhật`,
        result.unchanged ? `${result.unchanged} không thay đổi` : null,
        result.skipped
          ? `${result.skipped} bị bỏ qua do đã sử dụng nhiều hơn quota mới`
          : null,
        unavailable ? `${unavailable} không còn hợp lệ` : null,
      ]
        .filter(Boolean)
        .join(", ");
      toast.success(`Đã áp dụng quota: ${details}`);
      setOpen(false);
      setError(null);
    },
    onError: (mutationError) =>
      setError(
        getApiErrorMessage(
          mutationError,
          "Không thể áp dụng quota cho các nhân viên đã chọn.",
        ),
      ),
  });

  const openDialog = () => {
    const firstLeaveType = leaveTypes[0];
    if (!firstLeaveType) return;
    setLeaveTypeId(String(firstLeaveType.id));
    setSelectedYear(year);
    setAnnualGranted(String(Number(firstLeaveType.annualQuota)));
    setNote("");
    setSearch("");
    setDepartmentId("all");
    setPositionId("all");
    setQuotaStatus("all");
    setSelectedIds(new Set());
    setError(null);
    setOpen(true);
  };

  const handleLeaveTypeChange = (value: string) => {
    const leaveType = leaveTypes.find((item) => item.id === Number(value));
    setLeaveTypeId(value);
    setAnnualGranted(String(Number(leaveType?.annualQuota ?? 0)));
    setSelectedIds(new Set());
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number(value));
    setSelectedIds(new Set());
  };

  const toggleEmployee = (employeeId: number, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(employeeId);
      else next.delete(employeeId);
      return next;
    });
  };

  const toggleFilteredEmployees = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const employee of filteredEmployees) {
        if (checked) next.add(employee.id);
        else next.delete(employee.id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const amount = Number(annualGranted);
    if (selectedIds.size === 0) {
      setError("Vui lòng chọn ít nhất một nhân viên.");
      return;
    }
    if (
      !leaveTypeId ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount * 2 !== Math.round(amount * 2)
    ) {
      setError("Quota phải là số không âm và tăng theo bước 0,5 ngày.");
      return;
    }

    setError(null);
    mutation.mutate({
      employeeIds: Array.from(selectedIds),
      leaveTypeId: Number(leaveTypeId),
      year: selectedYear,
      annualGranted: amount,
      note: note.trim() || undefined,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={openDialog}
        disabled={leaveTypes.length === 0}
      >
        <UsersRound className="size-4" />
        Cập nhật ngày nghỉ phép
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!mutation.isPending) {
            setOpen(nextOpen);
            if (!nextOpen) setError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Áp dụng quota cho nhiều nhân viên</DialogTitle>
            <DialogDescription>
              Lọc và chọn các nhân viên cần thay đổi quota trong năm{" "}
              {selectedYear}. Nhân viên đã dùng nhiều hơn quota mới sẽ được bỏ
              qua.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="default-leave-type">Loại phép</Label>
                <Select
                  value={leaveTypeId}
                  onValueChange={handleLeaveTypeChange}
                >
                  <SelectTrigger id="default-leave-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((leaveType) => (
                      <SelectItem
                        key={leaveType.id}
                        value={String(leaveType.id)}
                      >
                        {leaveType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-year">Năm</Label>
                <Select
                  value={String(selectedYear)}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger id="default-year" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-annual-granted">
                  Quota năm {selectedYear} (ngày)
                </Label>
                <Input
                  id="default-annual-granted"
                  type="number"
                  min="0"
                  step="0.5"
                  value={annualGranted}
                  onChange={(event) => setAnnualGranted(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>Chọn nhân viên</Label>
                <Badge variant="outline">Đã chọn {selectedIds.size}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px_180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label="Tìm nhân viên"
                    className="pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm tên, mã hoặc email..."
                  />
                </div>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger
                    className="w-full"
                    aria-label="Lọc theo phòng ban"
                  >
                    <SelectValue placeholder="Phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phòng ban</SelectItem>
                    {departments.map((department) => (
                      <SelectItem
                        key={department.id}
                        value={String(department.id)}
                      >
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={positionId} onValueChange={setPositionId}>
                  <SelectTrigger
                    className="w-full"
                    aria-label="Lọc theo vị trí"
                  >
                    <SelectValue placeholder="Vị trí" />
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
                <Select value={quotaStatus} onValueChange={setQuotaStatus}>
                  <SelectTrigger
                    className="w-full"
                    aria-label="Lọc theo trạng thái quota"
                  >
                    <SelectValue placeholder="Trạng thái quota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="not-granted">Chưa được cấp</SelectItem>
                    <SelectItem value="granted">Đã được cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-72 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          aria-label="Chọn tất cả nhân viên đang hiển thị"
                          checked={filteredSelectionState}
                          disabled={
                            filteredEmployees.length === 0 ||
                            employeesLoading ||
                            (quotaStatus !== "all" &&
                              (grantedEmployeeIdsQuery.isLoading ||
                                grantedEmployeeIdsQuery.isError))
                          }
                          onCheckedChange={(checked) =>
                            toggleFilteredEmployees(checked === true)
                          }
                        />
                      </TableHead>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Trạng thái quota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeesLoading ||
                    (quotaStatus !== "all" &&
                      grantedEmployeeIdsQuery.isLoading) ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Đang tải danh sách nhân viên...
                        </TableCell>
                      </TableRow>
                    ) : employeesError ||
                      (quotaStatus !== "all" &&
                        grantedEmployeeIdsQuery.isError) ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-destructive"
                        >
                          Không thể tải danh sách nhân viên.
                        </TableCell>
                      </TableRow>
                    ) : filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Không có nhân viên phù hợp với bộ lọc.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow
                          key={employee.id}
                          className="cursor-pointer"
                          onClick={() =>
                            toggleEmployee(
                              employee.id,
                              !selectedIds.has(employee.id),
                            )
                          }
                        >
                          <TableCell>
                            <Checkbox
                              aria-label={`Chọn ${employee.fullName}`}
                              checked={selectedIds.has(employee.id)}
                              onCheckedChange={(checked) =>
                                toggleEmployee(employee.id, checked === true)
                              }
                              onClick={(event) => event.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {employee.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {employee.employeeCode} · {employee.email}
                            </div>
                          </TableCell>
                          <TableCell>{employee.department.name}</TableCell>
                          <TableCell>{employee.position.name}</TableCell>
                          <TableCell>
                            {grantedEmployeeIdsQuery.isLoading ? (
                              <span className="text-muted-foreground">
                                Đang kiểm tra...
                              </span>
                            ) : grantedEmployeeIdsQuery.isError ? (
                              <span className="text-muted-foreground">
                                Không xác định
                              </span>
                            ) : grantedEmployeeIds.has(employee.id) ? (
                              <Badge variant="outline">Đã được cấp</Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-700"
                              >
                                Chưa được cấp
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                Chọn tất cả chỉ áp dụng cho các nhân viên đang khớp bộ lọc; các
                lựa chọn trước đó vẫn được giữ lại.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-note">Ghi chú</Label>
              <Textarea
                id="default-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={`Áp dụng quota phép năm ${selectedYear}`}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={mutation.isPending || selectedIds.size === 0}
            >
              {mutation.isPending
                ? "Đang áp dụng..."
                : `Áp dụng cho ${selectedIds.size} nhân viên`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
