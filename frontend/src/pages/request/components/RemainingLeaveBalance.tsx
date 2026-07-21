import { useMemo } from "react";

import { useMyLeaveBalances } from "../../../hooks/useLeaveBalances";

const currentYear = new Date().getFullYear();

function formatDays(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 1,
  }).format(value);
}

export function RemainingLeaveBalance() {
  const { data: balances = [], isLoading, isError } = useMyLeaveBalances({
    year: currentYear,
  });

  const remainingDays = useMemo(
    () =>
      balances
        .filter((balance) => balance.leaveType.code === "ANNUAL_LEAVE")
        .reduce((total, balance) => total + Number(balance.remaining), 0),
    [balances],
  );

  return (
    <p
      className="shrink-0 text-sm font-semibold sm:text-base"
      aria-live="polite"
      title={isError ? "Không thể tải số ngày phép còn lại" : undefined}
    >
      Số ngày phép còn lại:{" "}
      <span className={isError ? "text-destructive" : "text-foreground"}>
        {isLoading ? "..." : isError ? "—" : formatDays(remainingDays)}
      </span>
    </p>
  );
}
