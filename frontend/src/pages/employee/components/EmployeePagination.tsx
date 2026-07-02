import { Button } from "../../../components/ui/button";

interface EmployeePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPage: (value: number) => void;
}

export function EmployeePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  setPage,
}: EmployeePaginationProps) {
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị {from}-{to} trên {totalItems} nhân viên
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setPage(page - 1)}
          disabled={!canGoPrev}
        >
          Trang trước
        </Button>
        <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
          Trang {page} / {totalPages}
        </div>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={!canGoNext}
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
}
