import { Edit, Trash2 } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { RequestType } from "@/types/request-type.type";

interface RequestTypeTableProps {
  requestTypes: RequestType[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (requestType: RequestType) => void;
  onDelete: (requestType: RequestType) => void;
}

const getStatusClass = (isActive: boolean) =>
  isActive
    ? "bg-emerald-500/10 text-emerald-700"
    : "bg-slate-500/10 text-slate-700";

export function RequestTypeTable({
  requestTypes,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
}: RequestTypeTableProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Đang tải danh sách loại yêu cầu...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 py-12 text-center">
        <p className="text-destructive">
          Không thể tải danh sách loại yêu cầu.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Tên loại yêu cầu</TableHead>
            <TableHead>Handler key</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {requestTypes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                Chưa có loại yêu cầu nào.
              </TableCell>
            </TableRow>
          ) : (
            requestTypes.map((requestType) => (
              <TableRow key={requestType.id}>
                <TableCell className="font-medium">
                  {requestType.code}
                </TableCell>
                <TableCell>{requestType.name}</TableCell>
                <TableCell>{requestType.handlerKey}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusClass(requestType.isActive)}
                  >
                    {requestType.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-64">
                  {requestType.description ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Sửa ${requestType.name}`}
                      onClick={() => onEdit(requestType)}
                    >
                      <Edit className="size-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Xóa ${requestType.name}`}
                      onClick={() => onDelete(requestType)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
