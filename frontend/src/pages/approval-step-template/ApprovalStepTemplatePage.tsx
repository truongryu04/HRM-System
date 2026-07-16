import { useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
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
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
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
import { usePositions } from "../../hooks/usePositions";
import {
  useApprovalStepTemplates,
  useCreateApprovalStepTemplate,
  useDeleteApprovalStepTemplate,
  useUpdateApprovalStepTemplate,
} from "../../hooks/useRequestConfig";
import { useRoles } from "../../hooks/useRoles";
import { useUsers } from "../../hooks/useUsers";
import type {
  ApprovalStepTemplate,
  ApproverType,
  CreateApprovalStepTemplateRequest,
} from "@/types/request-config.type";
import { ApprovalStepTemplateDialog } from "../approval-flow/components/ApprovalStepTemplateDialog";
import {
  approverTypeOptions,
  getApproverTypeLabel,
} from "../approval-flow/approval-flow.constants";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";

const ALL_APPROVER_TYPES = "ALL";

function formatCondition(condition?: Record<string, unknown> | null) {
  if (!condition || Object.keys(condition).length === 0) {
    return "-";
  }

  return JSON.stringify(condition);
}

function getSpecificUserLabel(template: ApprovalStepTemplate) {
  const user = template.specificUser;

  if (!user) {
    return "-";
  }

  return user.employee?.fullName ? `${user.employee.fullName} (${user.email})` : user.email;
}

export default function ApprovalStepTemplatePage() {
  const { can } = usePermissionAccess();
  const canCreate = can(PERMISSIONS.APPROVAL_STEP_TEMPLATE.CREATE);
  const canUpdate = can(PERMISSIONS.APPROVAL_STEP_TEMPLATE.UPDATE);
  const canDelete = can(PERMISSIONS.APPROVAL_STEP_TEMPLATE.DELETE);
  const canReadRoles = can(PERMISSIONS.ROLE.READ);
  const canReadPositions = can(PERMISSIONS.POSITION.READ);
  const canReadUsers = can(PERMISSIONS.USER.READ);
  const [search, setSearch] = useState("");
  const [approverTypeFilter, setApproverTypeFilter] =
    useState<ApproverType | typeof ALL_APPROVER_TYPES>(ALL_APPROVER_TYPES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ApprovalStepTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] =
    useState<ApprovalStepTemplate | null>(null);

  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useApprovalStepTemplates();
  const { data: roles = [] } = useRoles(canReadRoles);
  const { data: positions = [] } = usePositions(canReadPositions);
  const { data: usersResponse } = useUsers(
    { page: 1, limit: 100 },
    canReadUsers,
  );
  const users = usersResponse?.data ?? [];

  const createTemplateMutation = useCreateApprovalStepTemplate();
  const updateTemplateMutation = useUpdateApprovalStepTemplate();
  const deleteTemplateMutation = useDeleteApprovalStepTemplate();

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesType =
        approverTypeFilter === ALL_APPROVER_TYPES ||
        template.approverType === approverTypeFilter;
      const userLabel = getSpecificUserLabel(template).toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        template.stepName.toLowerCase().includes(normalizedSearch) ||
        template.roleCode?.toLowerCase().includes(normalizedSearch) ||
        template.positionCode?.toLowerCase().includes(normalizedSearch) ||
        userLabel.includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [approverTypeFilter, search, templates]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (template: ApprovalStepTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload: CreateApprovalStepTemplateRequest) => {
    if (editingTemplate) {
      await updateTemplateMutation.mutateAsync({
        id: editingTemplate.id,
        payload,
      });
      toast.success("Đã cập nhật mẫu bước duyệt");
      return;
    }

    await createTemplateMutation.mutateAsync(payload);
    toast.success("Đã tạo mẫu bước duyệt");
  };

  const handleDelete = async () => {
    if (!deletingTemplate) {
      return;
    }

    await deleteTemplateMutation.mutateAsync(deletingTemplate.id);
    toast.success("Đã xóa mềm mẫu bước duyệt");
    setDeletingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mẫu bước duyệt
          </h1>
          <p className="text-muted-foreground">
            Thư viện bước duyệt dùng lại cho các luồng yêu cầu.
          </p>
        </div>

        {canCreate ? <Button
          onClick={handleOpenCreate}
          className="bg-teal-500 text-white hover:bg-teal-700"
        >
          <Plus className="size-4" />
          Tạo mẫu
        </Button> : null}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tên, role, vị trí, user"
                  className="pl-9"
                />
              </div>

              <Select
                value={approverTypeFilter}
                onValueChange={(value) =>
                  setApproverTypeFilter(
                    value as ApproverType | typeof ALL_APPROVER_TYPES,
                  )
                }
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Kiểu người duyệt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_APPROVER_TYPES}>
                    Tất cả kiểu duyệt
                  </SelectItem>
                  {approverTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="size-4" />
              Làm mới
            </Button>
          </div>

          {isError ? (
            <div className="py-12 text-center text-destructive">
              Không tải được danh sách mẫu bước duyệt.
            </div>
          ) : isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Đang tải danh sách mẫu bước duyệt...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên bước</TableHead>
                    <TableHead>Kiểu người duyệt</TableHead>
                    <TableHead>Role code</TableHead>
                    <TableHead>Position code</TableHead>
                    <TableHead>User cụ thể</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    {canUpdate || canDelete ? <TableHead className="text-right">Thao tác</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={canUpdate || canDelete ? 8 : 7}
                        className="h-28 text-center text-muted-foreground"
                      >
                        Chưa có mẫu bước duyệt phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="min-w-48 font-medium">
                          {template.stepName}
                        </TableCell>
                        <TableCell>
                          {getApproverTypeLabel(template.approverType)}
                        </TableCell>
                        <TableCell>{template.roleCode || "-"}</TableCell>
                        <TableCell>{template.positionCode || "-"}</TableCell>
                        <TableCell className="min-w-56">
                          {getSpecificUserLabel(template)}
                        </TableCell>
                        <TableCell className="max-w-72 truncate font-mono text-xs">
                          {formatCondition(template.condition)}
                        </TableCell>
                        <TableCell>
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            Đang dùng
                          </Badge>
                        </TableCell>
                        {canUpdate || canDelete ? <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canUpdate ? <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Sửa mẫu"
                              onClick={() => handleOpenEdit(template)}
                            >
                              <Pencil className="size-4" />
                            </Button> : null}
                            {canDelete ? <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Xóa mềm mẫu"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeletingTemplate(template)}
                            >
                              <Trash2 className="size-4" />
                            </Button> : null}
                          </div>
                        </TableCell> : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {canCreate || canUpdate ? <ApprovalStepTemplateDialog
        key={`${dialogOpen ? "open" : "closed"}-${editingTemplate?.id ?? "create"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        roles={roles}
        positions={positions}
        users={users}
        loading={
          createTemplateMutation.isPending || updateTemplateMutation.isPending
        }
        onSubmit={handleSubmit}
      /> : null}

      {canDelete ? <AlertDialog
        open={Boolean(deletingTemplate)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTemplate(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mềm mẫu bước duyệt?</AlertDialogTitle>
            <AlertDialogDescription>
              Mẫu "{deletingTemplate?.stepName}" sẽ bị ẩn khỏi thư viện bước duyệt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteTemplateMutation.isPending}
              onClick={() => void handleDelete()}
            >
              Xóa mềm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> : null}
    </div>
  );
}
