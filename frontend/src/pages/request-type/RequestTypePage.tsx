import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  requestTypesQueryKey,
  useRequestTypes,
} from "../../hooks/useRequestTypes";
import {
  createRequestType,
  deleteRequestType,
  updateRequestType,
} from "../../services/request-type.api";
import type {
  RequestType,
  RequestTypeRequest,
} from "@/types/request-type.type";

type RequestTypeMode = "create" | "edit";

const emptyRequestTypeForm: RequestTypeRequest = {
  code: "",
  name: "",
  handlerKey: "",
  isActive: true,
  description: "",
};

const defaultRequestTypes: RequestTypeRequest[] = [
  {
    code: "LEAVE_REQUEST",
    name: "Xin nghỉ phép",
    handlerKey: "leave-request",
    isActive: true,
    description: "Yêu cầu nghỉ phép có phê duyệt.",
  },
  {
    code: "ATTENDANCE_CORRECTION",
    name: "Sửa chấm công",
    handlerKey: "attendance-correction",
    isActive: true,
    description: "Yêu cầu điều chỉnh dữ liệu chấm công.",
  },
  {
    code: "OVERTIME_REGISTRATION",
    name: "Đăng ký OT",
    handlerKey: "overtime-registration",
    isActive: true,
    description: "Yêu cầu đăng ký làm thêm giờ.",
  },
  {
    code: "SHIFT_CHANGE",
    name: "Đổi ca làm việc",
    handlerKey: "shift-change",
    isActive: true,
    description: "Yêu cầu đổi ca hoặc lịch làm việc.",
  },
  {
    code: "EQUIPMENT_BORROW",
    name: "Mượn thiết bị",
    handlerKey: "equipment-borrow",
    isActive: true,
    description: "Yêu cầu mượn thiết bị nội bộ.",
  },
];

function RequestTypeDialog({
  open,
  onOpenChange,
  mode,
  form,
  onFormChange,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RequestTypeMode;
  form: RequestTypeRequest;
  onFormChange: (form: RequestTypeRequest) => void;
  loading: boolean;
  onSubmit: () => Promise<void>;
}) {
  const updateForm = (payload: Partial<RequestTypeRequest>) => {
    onFormChange({ ...form, ...payload });
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.handlerKey.trim()) {
      toast.error("Vui lòng nhập code, tên loại yêu cầu và handler key");
      return;
    }

    await onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm loại yêu cầu" : "Cập nhật loại yêu cầu"}
          </DialogTitle>
          <DialogDescription>
            Thiết lập code, handler key và trạng thái sử dụng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="request-type-code">Code</Label>
            <Input
              id="request-type-code"
              value={form.code}
              onChange={(event) => updateForm({ code: event.target.value })}
              placeholder="LEAVE_REQUEST"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-type-name">Tên loại yêu cầu</Label>
            <Input
              id="request-type-name"
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              placeholder="Xin nghỉ phép"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-type-handler">Handler key</Label>
            <Input
              id="request-type-handler"
              value={form.handlerKey}
              onChange={(event) =>
                updateForm({ handlerKey: event.target.value })
              }
              placeholder="leave-request"
            />
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={form.isActive.toString()}
              onValueChange={(value) =>
                updateForm({ isActive: value === "true" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="request-type-description">Mô tả</Label>
            <Textarea
              id="request-type-description"
              value={form.description}
              onChange={(event) =>
                updateForm({ description: event.target.value })
              }
              placeholder="Mô tả mục đích sử dụng loại yêu cầu"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="bg-teal-500 text-white hover:bg-teal-700"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getStatusClass = (isActive: boolean) =>
  isActive
    ? "bg-emerald-500/10 text-emerald-700"
    : "bg-slate-500/10 text-slate-700";

export default function RequestTypePage() {
  const queryClient = useQueryClient();
  const {
    data: requestTypes = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useRequestTypes();

  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<RequestTypeMode>("create");
  const [form, setForm] = useState<RequestTypeRequest>(emptyRequestTypeForm);
  const [selectedRequestType, setSelectedRequestType] =
    useState<RequestType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RequestType | null>(null);

  const filteredRequestTypes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return requestTypes;

    return requestTypes.filter((requestType) =>
      [
        requestType.code,
        requestType.name,
        requestType.handlerKey,
        requestType.description ?? "",
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [requestTypes, search]);

  const createMutation = useMutation({
    mutationFn: createRequestType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestTypesQueryKey });
      toast.success("Tạo loại yêu cầu thành công");
      setOpenDialog(false);
      setSelectedRequestType(null);
    },
    onError: () => toast.error("Tạo loại yêu cầu thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: RequestTypeRequest;
    }) => updateRequestType(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestTypesQueryKey });
      toast.success("Cập nhật loại yêu cầu thành công");
      setOpenDialog(false);
      setSelectedRequestType(null);
    },
    onError: () => toast.error("Cập nhật loại yêu cầu thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequestType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestTypesQueryKey });
      toast.success("Xóa loại yêu cầu thành công");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Xóa loại yêu cầu thất bại"),
  });

  const getPayload = (): RequestTypeRequest => ({
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    handlerKey: form.handlerKey.trim(),
    isActive: form.isActive,
    description: form.description?.trim() || undefined,
  });

  const handleSubmit = async () => {
    const payload = getPayload();

    if (mode === "create") {
      await createMutation.mutateAsync(payload);
      return;
    }

    if (!selectedRequestType) return;
    await updateMutation.mutateAsync({
      id: selectedRequestType.id,
      payload,
    });
  };

  const openCreateDialog = () => {
    setMode("create");
    setForm(emptyRequestTypeForm);
    setSelectedRequestType(null);
    setOpenDialog(true);
  };

  const openEditDialog = (requestType: RequestType) => {
    setMode("edit");
    setForm({
      code: requestType.code,
      name: requestType.name,
      handlerKey: requestType.handlerKey,
      isActive: requestType.isActive,
      description: requestType.description ?? "",
    });
    setSelectedRequestType(requestType);
    setOpenDialog(true);
  };

  const createDefaultType = async (payload: RequestTypeRequest) => {
    await createMutation.mutateAsync(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý loại yêu cầu
          </h1>
          <p className="text-muted-foreground">
            Quản lý request_types dùng cho các luồng yêu cầu nội bộ.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCcw className="size-4" />
            Làm mới
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-teal-500 text-white hover:bg-teal-700"
          >
            <Plus className="size-4" />
            Thêm loại yêu cầu
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo code, tên, handler key"
                className="pl-9"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredRequestTypes.length} loại yêu cầu
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Đang tải danh sách loại yêu cầu...
            </div>
          ) : isError ? (
            <div className="space-y-3 py-12 text-center">
              <p className="text-destructive">
                Không thể tải danh sách loại yêu cầu.
              </p>
              <Button variant="outline" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          ) : (
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
                  {filteredRequestTypes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Chưa có loại yêu cầu nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequestTypes.map((requestType) => (
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
                              onClick={() => openEditDialog(requestType)}
                            >
                              <Edit className="size-4" />
                            </Button>

                            <AlertDialog
                              open={deleteTarget?.id === requestType.id}
                              onOpenChange={(open) =>
                                !open && setDeleteTarget(null)
                              }
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label={`Xóa ${requestType.name}`}
                                  onClick={() => setDeleteTarget(requestType)}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xóa loại yêu cầu?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Loại yêu cầu "{requestType.name}" sẽ bị xóa
                                    khỏi danh sách request_types.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteMutation.mutate(requestType.id)
                                    }
                                  >
                                    Xác nhận
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && !isError && requestTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Loại yêu cầu mặc định</h2>
              <p className="text-sm text-muted-foreground">
                Tạo nhanh các loại phổ biến: nghỉ phép, sửa chấm công, OT, đổi
                ca và mượn thiết bị.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {defaultRequestTypes.map((requestType) => (
                <Button
                  key={requestType.code}
                  variant="outline"
                  size="sm"
                  disabled={createMutation.isPending}
                  onClick={() => void createDefaultType(requestType)}
                >
                  {requestType.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <RequestTypeDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        mode={mode}
        form={form}
        onFormChange={setForm}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
