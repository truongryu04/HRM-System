import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
}

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-left",
    page - 1,
    page,
    page + 1,
    "ellipsis-right",
    totalPages,
  ];
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  setPage,
  setPageSize,
  pageSizeOptions = [10, 20, 50],
  itemName = "bản ghi",
}: PaginationProps) {
  const normalizedTotalPages = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(1, page), normalizedTotalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < normalizedTotalPages;
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const paginationItems = getPaginationItems(
    currentPage,
    normalizedTotalPages,
  );
  const availablePageSizes = Array.from(
    new Set([...pageSizeOptions, pageSize]),
  ).sort((left, right) => left - right);

  const handlePageSizeChange = (value: string) => {
    setPageSize?.(Number(value));
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị {from}-{to} trên {totalItems} {itemName}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {setPageSize ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">Giới hạn / trang</span>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger
                size="sm"
                className="w-20"
                aria-label="Chọn số bản ghi mỗi trang"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {availablePageSizes.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <nav
          className="flex min-w-0 items-center justify-center gap-1"
          aria-label="Phân trang"
        >
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-full"
            onClick={() => setPage(currentPage - 1)}
            disabled={!canGoPrev}
            aria-label="Trang trước"
          >
            <ChevronLeft />
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            {paginationItems.map((item) =>
              typeof item === "number" ? (
                <Button
                  key={item}
                  type="button"
                  size="icon"
                  variant={item === currentPage ? "primary" : "ghost"}
                  className="rounded-full"
                  onClick={() => setPage(item)}
                  aria-label={`Trang ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                >
                  {item}
                </Button>
              ) : (
                <span
                  key={item}
                  className="flex size-8 items-center justify-center text-muted-foreground"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="size-4" />
                </span>
              ),
            )}
          </div>

          <span className="min-w-24 text-center text-sm text-muted-foreground sm:hidden">
            Trang {currentPage} / {normalizedTotalPages}
          </span>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-full"
            onClick={() => setPage(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Trang sau"
          >
            <ChevronRight />
          </Button>
        </nav>
      </div>
    </div>
  );
}
