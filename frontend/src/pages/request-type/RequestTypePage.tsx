import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
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
import { DefaultRequestTypesCard } from "./components/DefaultRequestTypesCard";
import { RequestTypeDeleteDialog } from "./components/RequestTypeDeleteDialog";
import { RequestTypeDialog } from "./components/RequestTypeDialog";
import { RequestTypeTable } from "./components/RequestTypeTable";
import { RequestTypeToolbar } from "./components/RequestTypeToolbar";
import {
  emptyRequestTypeForm,
  type RequestTypeMode,
} from "./request-type.constants";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";
export default function RequestTypePage() {
  const { can } = usePermissionAccess();
  const canCreate = can(PERMISSIONS.REQUEST_TYPE.CREATE);
  const canUpdate = can(PERMISSIONS.REQUEST_TYPE.UPDATE);
  const canDelete = can(PERMISSIONS.REQUEST_TYPE.DELETE);
  const queryClient = useQueryClient();
  const {
    data: requestTypes = [],
    isLoading,
    isError,
    refetch,
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

    if (!keyword) {
      return requestTypes;
    }

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

    if (!selectedRequestType) {
      return;
    }

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

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteMutation.mutate(deleteTarget.id);
  };

  const showDefaultRequestTypes =
    !isLoading && !isError && requestTypes.length === 0;

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Quản lý loại yêu cầu
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {canCreate ? (
              <Button onClick={openCreateDialog} variant="primary">
                <Plus className="size-4" />
                Thêm loại yêu cầu
              </Button>
            ) : null}
          </div>
        </div>
        <RequestTypeToolbar
          search={search}
          total={filteredRequestTypes.length}
          onSearchChange={setSearch}
        />

        <RequestTypeTable
          requestTypes={filteredRequestTypes}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          onEdit={openEditDialog}
          onDelete={setDeleteTarget}
          canEdit={canUpdate}
          canDelete={canDelete}
        />

        {showDefaultRequestTypes && canCreate ? (
          <DefaultRequestTypesCard
            loading={createMutation.isPending}
            onCreate={(payload) => void createMutation.mutateAsync(payload)}
          />
        ) : null}

        {canCreate || canUpdate ? (
          <RequestTypeDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            mode={mode}
            form={form}
            onFormChange={setForm}
            loading={createMutation.isPending || updateMutation.isPending}
            onSubmit={handleSubmit}
          />
        ) : null}

        {canDelete ? (
          <RequestTypeDeleteDialog
            requestType={deleteTarget}
            loading={deleteMutation.isPending}
            onOpenChange={(open) => {
              if (!open) {
                setDeleteTarget(null);
              }
            }}
            onConfirm={handleDelete}
          />
        ) : null}
      </div>
    </Card>
  );
}
