import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
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
import { Textarea } from "../../components/ui/textarea";
import { leaveBalanceKeys } from "../../hooks/useLeaveBalances";
import { grantDefaultLeaveBalance } from "../../services/leave-balance.api";
import type { LeaveType } from "../../types/leave.type";
import { getApiErrorMessage } from "../../utils/api-error";

interface GrantDefaultLeaveBalanceDialogProps {
  year: number;
  leaveTypes: LeaveType[];
}

export function GrantDefaultLeaveBalanceDialog({
  year,
  leaveTypes,
}: GrantDefaultLeaveBalanceDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [annualGranted, setAnnualGranted] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: grantDefaultLeaveBalance,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: leaveBalanceKeys.all });
      const applied = result.created + result.updated;
      const details = [
        `${applied} nhân viên được áp dụng`,
        result.unchanged ? `${result.unchanged} không thay đổi` : null,
        result.skipped ? `${result.skipped} bị bỏ qua` : null,
      ]
        .filter(Boolean)
        .join(", ");
      toast.success(`Đã đặt phép mặc định: ${details}`);
      setOpen(false);
      setError(null);
    },
    onError: (mutationError) =>
      setError(
        getApiErrorMessage(
          mutationError,
          "Không thể đặt phép mặc định cho nhân viên.",
        ),
      ),
  });

  const openDialog = () => {
    const firstLeaveType = leaveTypes[0];
    if (!firstLeaveType) return;
    setLeaveTypeId(String(firstLeaveType.id));
    setAnnualGranted(String(Number(firstLeaveType.annualQuota)));
    setNote("");
    setError(null);
    setOpen(true);
  };

  const handleLeaveTypeChange = (value: string) => {
    const leaveType = leaveTypes.find((item) => item.id === Number(value));
    setLeaveTypeId(value);
    setAnnualGranted(String(Number(leaveType?.annualQuota ?? 0)));
  };

  const handleSubmit = () => {
    const amount = Number(annualGranted);
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
      leaveTypeId: Number(leaveTypeId),
      year,
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
        Đặt phép mặc định
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Đặt phép mặc định cho nhân viên</DialogTitle>
            <DialogDescription>
              Quota mới sẽ được áp dụng cho tất cả nhân viên chưa nghỉ việc hoặc
              chấm dứt hợp đồng trong năm {year}. Nhân viên đã dùng nhiều hơn
              quota mới sẽ được bỏ qua.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-leave-type">Loại phép</Label>
              <Select value={leaveTypeId} onValueChange={handleLeaveTypeChange}>
                <SelectTrigger id="default-leave-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((leaveType) => (
                    <SelectItem key={leaveType.id} value={String(leaveType.id)}>
                      {leaveType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-annual-granted">
                Quota năm {year} (ngày)
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

            <div className="space-y-2">
              <Label htmlFor="default-note">Ghi chú</Label>
              <Textarea
                id="default-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={`Đặt quota phép mặc định năm ${year}`}
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
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Đang áp dụng..." : "Áp dụng cho tất cả"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
