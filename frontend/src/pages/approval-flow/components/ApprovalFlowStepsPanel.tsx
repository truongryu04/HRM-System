import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useDeleteApprovalFlowStep,
  useApprovalFlowSteps,
} from "../../../hooks/useRequestConfig";
import type {
  ApprovalFlow,
  ApprovalFlowStep,
} from "@/types/request-config.type";
import { getApproverTypeLabel } from "../approval-flow.constants";

interface ApprovalFlowStepsPanelProps {
  flow: ApprovalFlow | null;
  onAddStepFromTemplate: () => void;
  onEditStep: (step: ApprovalFlowStep) => void;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

function getApproverTarget(step: ApprovalFlowStep) {
  if (step.approverType === "ROLE") {
    return step.roleCode ?? "-";
  }

  if (step.approverType === "POSITION") {
    return step.positionCode ?? "-";
  }

  if (step.approverType === "SPECIFIC_USER") {
    return step.specificUser?.email ?? `User #${step.specificUser?.id ?? "-"}`;
  }

  return "-";
}

export function ApprovalFlowStepsPanel({
  flow,
  onAddStepFromTemplate,
  onEditStep,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
}: ApprovalFlowStepsPanelProps) {
  const { data: steps = [], isLoading } = useApprovalFlowSteps(flow?.id, canRead);
  const deleteStepMutation = useDeleteApprovalFlowStep();

  const handleDelete = async (step: ApprovalFlowStep) => {
    await deleteStepMutation.mutateAsync(step.id);
    toast.success("Đã xóa bước duyệt");
  };

  if (!flow || !canRead) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Chọn một flow để cấu hình các bước duyệt.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Cấu hình bước duyệt</CardTitle>
          <p className="text-sm text-muted-foreground">{flow.name}</p>
        </div>
        {canCreate ? <Button onClick={onAddStepFromTemplate} className="bg-teal-500 text-white hover:bg-teal-700">
          <Plus className="size-4" />
          Thêm từ mẫu
        </Button> : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Đang tải bước duyệt...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Tên bước</TableHead>
                  <TableHead>Kiểu duyệt</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Flow này chưa có bước duyệt.
                    </TableCell>
                  </TableRow>
                ) : (
                  steps.map((step) => (
                    <TableRow key={step.id}>
                      <TableCell>
                        <Badge variant="outline">#{step.stepOrder}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {step.stepName}
                      </TableCell>
                      <TableCell>
                        {getApproverTypeLabel(step.approverType)}
                      </TableCell>
                      <TableCell>{getApproverTarget(step)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canUpdate ? <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Sửa bước"
                            onClick={() => onEditStep(step)}
                          >
                            <Pencil className="size-4" />
                          </Button> : null}
                          {canDelete ? <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Xóa bước"
                            className="text-destructive hover:text-destructive"
                            disabled={deleteStepMutation.isPending}
                            onClick={() => void handleDelete(step)}
                          >
                            <Trash2 className="size-4" />
                          </Button> : null}
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
  );
}
