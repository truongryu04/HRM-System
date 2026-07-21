import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { History, PencilLine, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import { useEmployees } from "../../hooks/useEmployees";
import {
  leaveBalanceKeys,
  useEmployeeLeaveBalanceHistory,
  useEmployeeLeaveBalances,
} from "../../hooks/useLeaveBalances";
import { useLeaveTypes } from "../../hooks/useLeaveRequests";
import {
  adjustLeaveBalance,
  grantLeaveBalance,
} from "../../services/leave-balance.api";
import type {
  LeaveBalance,
  LeaveBalanceTransactionType,
} from "../../types/leave.type";
import { getApiErrorMessage } from "../../utils/api-error";
import { GrantDefaultLeaveBalanceDialog } from "./GrantDefaultLeaveBalanceDialog";
import { EmployeeSearchCombobox } from "./EmployeeSearchCombobox";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, index) => currentYear + 1 - index);
const transactionLabels: Record<LeaveBalanceTransactionType, string> = {
  GRANT: "Cấp quota",
  ADJUSTMENT: "Điều chỉnh",
  DEDUCT: "Sử dụng phép",
  REFUND: "Hoàn phép",
  CARRY_OVER: "Chuyển phép",
  EXPIRE: "Hết hạn",
};

function formatDays(value: number | string) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(Number(value))} ngày`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
}

export default function LeaveBalanceManagementPage() {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [year, setYear] = useState(currentYear);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantLeaveTypeId, setGrantLeaveTypeId] = useState("");
  const [grantAmount, setGrantAmount] = useState("12");
  const [grantNote, setGrantNote] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<LeaveBalance | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const query = useMemo(() => ({ year }), [year]);

  const employeesQuery = useEmployees({ page: 1, limit: 1000 });
  const leaveTypesQuery = useLeaveTypes();
  const balancesQuery = useEmployeeLeaveBalances(employeeId, query);
  const historyQuery = useEmployeeLeaveBalanceHistory(employeeId, query);
  const employees = employeesQuery.data?.data ?? [];
  const leaveTypes = (leaveTypesQuery.data ?? []).filter(
    (leaveType) => leaveType.deductFromBalance && leaveType.isActive !== false,
  );
  const balances = balancesQuery.data ?? [];
  const history = historyQuery.data ?? [];

  const refreshBalance = async () => {
    await queryClient.invalidateQueries({ queryKey: leaveBalanceKeys.all });
  };

  const grantMutation = useMutation({
    mutationFn: grantLeaveBalance,
    onSuccess: async () => {
      await refreshBalance();
      toast.success("Đã cập nhật quota nghỉ phép");
      setGrantOpen(false);
      setDialogError(null);
    },
    onError: (error) =>
      setDialogError(
        getApiErrorMessage(error, "Không thể cập nhật quota nghỉ phép."),
      ),
  });

  const adjustMutation = useMutation({
    mutationFn: ({
      id,
      amount,
      reason,
    }: {
      id: number;
      amount: number;
      reason: string;
    }) => adjustLeaveBalance(id, { amount, reason }),
    onSuccess: async () => {
      await refreshBalance();
      toast.success("Đã điều chỉnh số ngày nghỉ phép");
      setAdjustTarget(null);
      setDialogError(null);
    },
    onError: (error) =>
      setDialogError(
        getApiErrorMessage(error, "Không thể điều chỉnh số ngày nghỉ phép."),
      ),
  });

  const openGrant = () => {
    if (!employeeId || leaveTypes.length === 0) return;
    const existing = balances.find(
      (balance) => balance.leaveType.id === leaveTypes[0].id,
    );
    setGrantLeaveTypeId(String(leaveTypes[0].id));
    setGrantAmount(
      String(existing?.annualGranted ?? Number(leaveTypes[0].annualQuota)),
    );
    setGrantNote("");
    setDialogError(null);
    setGrantOpen(true);
  };

  const selectGrantLeaveType = (value: string) => {
    const leaveTypeId = Number(value);
    const existing = balances.find(
      (balance) => balance.leaveType.id === leaveTypeId,
    );
    const leaveType = leaveTypes.find((item) => item.id === leaveTypeId);
    setGrantLeaveTypeId(value);
    setGrantAmount(
      String(existing?.annualGranted ?? Number(leaveType?.annualQuota ?? 0)),
    );
  };

  const submitGrant = () => {
    const amount = Number(grantAmount);
    if (
      !employeeId ||
      !grantLeaveTypeId ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount * 2 !== Math.round(amount * 2)
    ) {
      setDialogError("Vui lòng nhập quota không âm theo bước 0,5 ngày.");
      return;
    }
    grantMutation.mutate({
      employeeId,
      leaveTypeId: Number(grantLeaveTypeId),
      year,
      annualGranted: amount,
      note: grantNote.trim() || undefined,
    });
  };

  const openAdjust = (balance: LeaveBalance) => {
    setAdjustTarget(balance);
    setAdjustAmount("");
    setAdjustReason("");
    setDialogError(null);
  };

  const submitAdjustment = () => {
    const amount = Number(adjustAmount);
    if (
      !adjustTarget ||
      !Number.isFinite(amount) ||
      amount === 0 ||
      amount * 2 !== Math.round(amount * 2)
    ) {
      setDialogError("Mức điều chỉnh phải khác 0 và tăng theo bước 0,5 ngày.");
      return;
    }
    if (!adjustReason.trim()) {
      setDialogError("Vui lòng nhập lý do điều chỉnh.");
      return;
    }
    adjustMutation.mutate({
      id: adjustTarget.id,
      amount,
      reason: adjustReason.trim(),
    });
  };

  const loading =
    employeeId !== null && (balancesQuery.isLoading || historyQuery.isLoading);
  const error = balancesQuery.isError || historyQuery.isError;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Quản lý số ngày nghỉ phép
            </h2>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <GrantDefaultLeaveBalanceDialog
              year={year}
              leaveTypes={leaveTypes}
            />
            <Button
              variant="primary"
              onClick={openGrant}
              disabled={!employeeId || leaveTypes.length === 0}
            >
              <Plus className="size-4" /> Cấp hoặc cập nhật quota
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div className="space-y-2">
              <Label htmlFor="balance-employee">Nhân viên</Label>
              <EmployeeSearchCombobox
                employees={employees}
                value={employeeId}
                onChange={setEmployeeId}
                loading={employeesQuery.isLoading}
                error={employeesQuery.isError}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance-year">Năm</Label>
              <Select
                value={String(year)}
                onValueChange={(value) => setYear(Number(value))}
              >
                <SelectTrigger id="balance-year" className="w-full">
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
          </CardContent>
        </Card>

        {!employeeId ? (
          <Card className="items-center p-12 text-center text-muted-foreground">
            Chọn nhân viên để xem và quản lý số ngày nghỉ phép.
          </Card>
        ) : loading ? (
          <Card className="items-center p-12 text-center text-muted-foreground">
            Đang tải số ngày nghỉ phép...
          </Card>
        ) : error ? (
          <Card className="items-center p-12 text-center">
            <p className="text-destructive">
              Không thể tải số ngày của nhân viên.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                void balancesQuery.refetch();
                void historyQuery.refetch();
              }}
            >
              Thử lại
            </Button>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Số ngày nghỉ phép năm {year}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại phép</TableHead>
                      <TableHead>Được cấp</TableHead>
                      <TableHead>Chuyển sang</TableHead>
                      <TableHead>Điều chỉnh</TableHead>
                      <TableHead>Đã dùng</TableHead>
                      <TableHead>Còn lại</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-12 text-center text-muted-foreground"
                        >
                          Nhân viên chưa được cấp quota cho năm {year}.
                        </TableCell>
                      </TableRow>
                    ) : (
                      balances.map((balance) => (
                        <TableRow key={balance.id}>
                          <TableCell className="font-medium">
                            {balance.leaveType.name}
                          </TableCell>
                          <TableCell>
                            {formatDays(balance.annualGranted)}
                          </TableCell>
                          <TableCell>
                            {formatDays(balance.carryOverGranted)}
                          </TableCell>
                          <TableCell>
                            {formatDays(balance.adjustment)}
                          </TableCell>
                          <TableCell>
                            {formatDays(
                              Number(balance.annualUsed) +
                                Number(balance.carryOverUsed),
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-700"
                            >
                              {formatDays(balance.remaining)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAdjust(balance)}
                            >
                              <PencilLine className="size-4" /> Điều chỉnh
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <History className="size-4" /> Lịch sử biến động
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại phép</TableHead>
                      <TableHead>Nghiệp vụ</TableHead>
                      <TableHead>Số ngày</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-12 text-center text-muted-foreground"
                        >
                          Chưa có lịch sử biến động.
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((item) => {
                        const amount = Number(item.amount);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatDate(item.createdAt)}
                            </TableCell>
                            <TableCell>{item.balance.leaveType.name}</TableCell>
                            <TableCell>
                              {transactionLabels[item.type]}
                            </TableCell>
                            <TableCell
                              className={
                                amount > 0
                                  ? "font-medium text-emerald-700"
                                  : "font-medium text-destructive"
                              }
                            >
                              {amount > 0 ? "+" : ""}
                              {formatDays(amount)}
                            </TableCell>
                            <TableCell className="min-w-64 text-muted-foreground">
                              {item.note || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        <Dialog
          open={grantOpen}
          onOpenChange={(open) => {
            setGrantOpen(open);
            if (!open) setDialogError(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cấp hoặc cập nhật quota</DialogTitle>
              <DialogDescription>
                Giá trị mới sẽ thay thế quota năm hiện tại; lịch sử chỉ ghi phần
                chênh lệch.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grant-leave-type">Loại phép</Label>
                <Select
                  value={grantLeaveTypeId}
                  onValueChange={selectGrantLeaveType}
                >
                  <SelectTrigger id="grant-leave-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grant-amount">Quota năm {year}</Label>
                <Input
                  id="grant-amount"
                  type="number"
                  min="0"
                  step="0.5"
                  value={grantAmount}
                  onChange={(event) => setGrantAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grant-note">Ghi chú</Label>
                <Textarea
                  id="grant-note"
                  value={grantNote}
                  onChange={(event) => setGrantNote(event.target.value)}
                  placeholder={`Cấp quota phép năm ${year}`}
                />
              </div>
              {dialogError ? (
                <p role="alert" className="text-sm text-destructive">
                  {dialogError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                disabled={grantMutation.isPending}
                onClick={submitGrant}
              >
                {grantMutation.isPending ? "Đang lưu..." : "Lưu quota"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(adjustTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setAdjustTarget(null);
              setDialogError(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Điều chỉnh số ngày nghỉ phép</DialogTitle>
              <DialogDescription>
                Nhập số dương để cộng hoặc số âm để trừ. Số dư sau điều chỉnh
                không được âm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adjust-amount">Mức điều chỉnh (ngày)</Label>
                <Input
                  id="adjust-amount"
                  type="number"
                  step="0.5"
                  value={adjustAmount}
                  onChange={(event) => setAdjustAmount(event.target.value)}
                  placeholder="Ví dụ: 1 hoặc -0.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjust-reason">Lý do</Label>
                <Textarea
                  id="adjust-reason"
                  value={adjustReason}
                  onChange={(event) => setAdjustReason(event.target.value)}
                  placeholder="Nhập lý do điều chỉnh"
                />
              </div>
              {dialogError ? (
                <p role="alert" className="text-sm text-destructive">
                  {dialogError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustTarget(null)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                disabled={adjustMutation.isPending}
                onClick={submitAdjustment}
              >
                {adjustMutation.isPending
                  ? "Đang lưu..."
                  : "Xác nhận điều chỉnh"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
