import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
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
import {
  useApprovalFlows,
  useApprovalStepTemplates,
  useCreateApprovalFlow,
  useCreateApprovalFlowStepFromTemplate,
  useDeleteApprovalFlow,
  useRequestTypes,
  useUpdateApprovalFlow,
  useUpdateApprovalFlowStep,
} from "../../hooks/useRequestConfig";
import type {
  ApprovalFlow,
  ApprovalFlowStep,
  ApprovalFlowWithStepCount,
  CreateApprovalFlowRequest,
  CreateApprovalFlowStepFromTemplateRequest,
} from "@/types/request-config.type";
import { AddStepFromTemplateDialog } from "./components/AddStepFromTemplateDialog";
import { ApprovalFlowDialog } from "./components/ApprovalFlowDialog";
import { ApprovalFlowStepDialog } from "./components/ApprovalFlowStepDialog";
import { ApprovalFlowStepsPanel } from "./components/ApprovalFlowStepsPanel";
import { PERMISSIONS } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";
import { useLeaveTypes } from "../../hooks/useLeaveRequests";

export default function ApprovalFlowManagementPage() {
  const { can } = usePermissionAccess();
  const canCreateFlow = can(PERMISSIONS.APPROVAL_FLOW.CREATE);
  const canUpdateFlow = can(PERMISSIONS.APPROVAL_FLOW.UPDATE);
  const canDeleteFlow = can(PERMISSIONS.APPROVAL_FLOW.DELETE);
  const canReadSteps = can(PERMISSIONS.APPROVAL_FLOW_STEP.READ);
  const canCreateStep = can(PERMISSIONS.APPROVAL_FLOW_STEP.CREATE);
  const canUpdateStep = can(PERMISSIONS.APPROVAL_FLOW_STEP.UPDATE);
  const canDeleteStep = can(PERMISSIONS.APPROVAL_FLOW_STEP.DELETE);
  const canReadTemplates = can(PERMISSIONS.APPROVAL_STEP_TEMPLATE.READ);
  const canReadRequestTypes = can(PERMISSIONS.REQUEST_TYPE.READ);
  const canReadLeaveTypes = can(PERMISSIONS.LEAVE_TYPE.READ);
  const navigate = useNavigate();
  const [requestTypeFilter, setRequestTypeFilter] = useState("all");
  const [flowDialogOpen, setFlowDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [addFromTemplateOpen, setAddFromTemplateOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] =
    useState<ApprovalFlowWithStepCount | null>(null);
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null);
  const [editingStep, setEditingStep] = useState<ApprovalFlowStep | null>(null);

  const selectedRequestTypeId =
    requestTypeFilter === "all" ? undefined : Number(requestTypeFilter);

  const { data: requestTypes = [] } = useRequestTypes(canReadRequestTypes);
  const { data: leaveTypes = [], isLoading: leaveTypesLoading } =
    useLeaveTypes(canReadLeaveTypes);
  const {
    data: flows = [],
    isLoading,
    refetch,
  } = useApprovalFlows(selectedRequestTypeId);
  const { data: stepTemplates = [] } =
    useApprovalStepTemplates(canReadTemplates);

  const createFlowMutation = useCreateApprovalFlow();
  const updateFlowMutation = useUpdateApprovalFlow();
  const deleteFlowMutation = useDeleteApprovalFlow();
  const createStepFromTemplateMutation =
    useCreateApprovalFlowStepFromTemplate();
  const updateStepMutation = useUpdateApprovalFlowStep();

  const activeFlows = useMemo(
    () => flows.filter((flow) => flow.isActive).length,
    [flows],
  );

  const defaultFlows = useMemo(
    () => flows.filter((flow) => flow.isDefault).length,
    [flows],
  );

  const handleOpenCreateFlow = () => {
    setEditingFlow(null);
    setFlowDialogOpen(true);
  };

  const handleOpenEditFlow = (flow: ApprovalFlow) => {
    setEditingFlow(flow);
    setFlowDialogOpen(true);
  };

  const handleSubmitFlow = async (payload: CreateApprovalFlowRequest) => {
    if (editingFlow) {
      await updateFlowMutation.mutateAsync({
        id: editingFlow.id,
        payload,
      });
      toast.success("Đã cập nhật luồng duyệt");
      return;
    }

    await createFlowMutation.mutateAsync(payload);
    toast.success("Đã tạo luồng duyệt");
  };

  const handleDeleteFlow = async (flow: ApprovalFlowWithStepCount) => {
    await deleteFlowMutation.mutateAsync(flow.id);
    toast.success("Đã xóa luồng duyệt");

    if (selectedFlow?.id === flow.id) {
      setSelectedFlow(null);
    }
  };

  const handleSetDefault = async (flow: ApprovalFlow) => {
    await updateFlowMutation.mutateAsync({
      id: flow.id,
      payload: { isDefault: true, isActive: true },
    });
    toast.success("Đã đặt flow mặc định");
  };

  const handleToggleActive = async (flow: ApprovalFlow) => {
    await updateFlowMutation.mutateAsync({
      id: flow.id,
      payload: { isActive: !flow.isActive },
    });
    toast.success(flow.isActive ? "Đã tắt flow" : "Đã bật flow");
  };

  const handleOpenAddStepFromTemplate = () => {
    setAddFromTemplateOpen(true);
  };

  const handleOpenEditStep = (step: ApprovalFlowStep) => {
    setEditingStep(step);
    setStepDialogOpen(true);
  };

  const handleSubmitStep = async (
    payload: CreateApprovalFlowStepFromTemplateRequest,
  ) => {
    if (!editingStep) {
      return;
    }

    await updateStepMutation.mutateAsync({
      id: editingStep.id,
      payload,
    });
    toast.success("Đã cập nhật bước duyệt");
    setEditingStep(null);
  };

  const handleAddStepFromTemplate = async (
    payload: CreateApprovalFlowStepFromTemplateRequest,
  ) => {
    if (!selectedFlow) {
      return;
    }

    await createStepFromTemplateMutation.mutateAsync({
      flowId: selectedFlow.id,
      payload,
    });
    toast.success("Đã thêm bước từ mẫu vào flow");
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Quản lý luồng duyệt
            </h2>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {canReadTemplates ? (
              <Button
                variant="primary"
                onClick={() => navigate("/approval-step-templates")}
              >
                <FileText className="size-4" />
                Mẫu duyệt
              </Button>
            ) : null}
            {canCreateFlow ? (
              <Button variant="primary" onClick={handleOpenCreateFlow}>
                <Plus className="size-4" />
                Thêm flow
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tổng flow</p>
              <p className="text-2xl font-semibold">{flows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold">{activeFlows}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Mặc định</p>
              <p className="text-2xl font-semibold">{defaultFlows}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Select
                value={requestTypeFilter}
                onValueChange={setRequestTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Lọc theo loại request" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại request</SelectItem>
                  {requestTypes.map((requestType) => (
                    <SelectItem
                      key={requestType.id}
                      value={String(requestType.id)}
                    >
                      {requestType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => void refetch()}>
                Làm mới
              </Button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Đang tải danh sách luồng duyệt...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên flow</TableHead>
                      <TableHead>Loại request</TableHead>
                      <TableHead>Loại chi tiết</TableHead>
                      <TableHead>Mặc định</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Số bước duyệt</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-28 text-center text-muted-foreground"
                        >
                          Chưa có luồng duyệt nào.
                        </TableCell>
                      </TableRow>
                    ) : (
                      flows.map((flow) => (
                        <TableRow key={flow.id}>
                          <TableCell className="font-medium">
                            {flow.name}
                          </TableCell>
                          <TableCell>{flow.requestType?.name ?? "-"}</TableCell>
                          <TableCell>
                            {flow.subtypeLabel ?? "Áp dụng chung"}
                          </TableCell>
                          <TableCell>
                            {flow.isDefault ? (
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                Có
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">
                                Không
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {canUpdateFlow ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleToggleActive(flow)}
                                disabled={updateFlowMutation.isPending}
                                className={
                                  flow.isActive
                                    ? "text-emerald-700 hover:text-emerald-700"
                                    : "text-muted-foreground"
                                }
                              >
                                {flow.isActive ? "Active" : "Inactive"}
                              </Button>
                            ) : (
                              <span>
                                {flow.isActive ? "Active" : "Inactive"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{flow.stepCount}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {canReadSteps ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Cấu hình bước"
                                  onClick={() => setSelectedFlow(flow)}
                                >
                                  <Settings2 className="size-4" />
                                </Button>
                              ) : null}
                              {canUpdateFlow ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Sửa flow"
                                  onClick={() => handleOpenEditFlow(flow)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              ) : null}
                              {canUpdateFlow ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Đặt mặc định"
                                  disabled={
                                    flow.isDefault ||
                                    updateFlowMutation.isPending
                                  }
                                  onClick={() => void handleSetDefault(flow)}
                                >
                                  <CheckCircle2 className="size-4" />
                                </Button>
                              ) : null}
                              {canDeleteFlow ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Xóa flow"
                                  className="text-destructive hover:text-destructive"
                                  disabled={deleteFlowMutation.isPending}
                                  onClick={() => void handleDeleteFlow(flow)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              ) : null}
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

        <ApprovalFlowStepsPanel
          flow={selectedFlow}
          onAddStepFromTemplate={handleOpenAddStepFromTemplate}
          onEditStep={handleOpenEditStep}
          canRead={canReadSteps}
          canCreate={canCreateStep && canReadTemplates}
          canUpdate={canUpdateStep}
          canDelete={canDeleteStep}
        />

        {canCreateFlow || canUpdateFlow ? (
          <ApprovalFlowDialog
            key={`${flowDialogOpen ? "open" : "closed"}-${editingFlow?.id ?? "create"}`}
            open={flowDialogOpen}
            onOpenChange={setFlowDialogOpen}
            flow={editingFlow}
            requestTypes={requestTypes}
            leaveTypes={leaveTypes}
            leaveTypesLoading={leaveTypesLoading}
            canReadLeaveTypes={canReadLeaveTypes}
            loading={
              createFlowMutation.isPending || updateFlowMutation.isPending
            }
            onSubmit={handleSubmitFlow}
          />
        ) : null}

        {canUpdateStep ? (
          <ApprovalFlowStepDialog
            key={`${stepDialogOpen ? "open" : "closed"}-${editingStep?.id ?? "none"}`}
            open={stepDialogOpen}
            onOpenChange={(open) => {
              setStepDialogOpen(open);
              if (!open) {
                setEditingStep(null);
              }
            }}
            step={editingStep}
            templates={stepTemplates}
            loading={updateStepMutation.isPending}
            onSubmit={handleSubmitStep}
          />
        ) : null}

        {canCreateStep && canReadTemplates ? (
          <AddStepFromTemplateDialog
            key={`${addFromTemplateOpen ? "open" : "closed"}-${selectedFlow?.id ?? "none"}-${selectedFlow?.stepCount ?? 0}`}
            open={addFromTemplateOpen}
            onOpenChange={setAddFromTemplateOpen}
            templates={stepTemplates}
            nextStepOrder={(selectedFlow?.stepCount ?? 0) + 1}
            loading={createStepFromTemplateMutation.isPending}
            onSubmit={handleAddStepFromTemplate}
          />
        ) : null}
      </div>
    </Card>
  );
}
