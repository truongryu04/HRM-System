import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { useDeleteApprovalStepTemplate } from "../../../hooks/useRequestConfig";
import type { ApprovalStepTemplate } from "@/types/request-config.type";
import { getApproverTypeLabel } from "../approval-flow.constants";

interface ApprovalStepTemplatePanelProps {
  templates: ApprovalStepTemplate[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (template: ApprovalStepTemplate) => void;
}

function getTemplateTarget(template: ApprovalStepTemplate) {
  if (template.approverType === "ROLE") {
    return template.roleCode ?? "-";
  }

  if (template.approverType === "POSITION") {
    return template.positionCode ?? "-";
  }

  if (template.approverType === "SPECIFIC_USER") {
    return template.specificUser?.email ?? `User #${template.specificUser?.id ?? "-"}`;
  }

  return "-";
}

export function ApprovalStepTemplatePanel({
  templates,
  isLoading,
  onCreate,
  onEdit,
}: ApprovalStepTemplatePanelProps) {
  const deleteTemplateMutation = useDeleteApprovalStepTemplate();

  const handleDelete = async (template: ApprovalStepTemplate) => {
    await deleteTemplateMutation.mutateAsync(template.id);
    toast.success("Đã xóa mẫu bước duyệt");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Thư viện bước duyệt</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tạo trước các bước duyệt để chọn khi cấu hình flow.
          </p>
        </div>
        <Button onClick={onCreate} className="bg-teal-500 text-white hover:bg-teal-700">
          <Plus className="size-4" />
          Tạo bước
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Đang tải thư viện bước duyệt...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bước</TableHead>
                  <TableHead>Kiểu duyệt</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Chưa có mẫu bước duyệt nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.stepName}
                      </TableCell>
                      <TableCell>
                        {getApproverTypeLabel(template.approverType)}
                      </TableCell>
                      <TableCell>{getTemplateTarget(template)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Sửa mẫu"
                            onClick={() => onEdit(template)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Xóa mẫu"
                            className="text-destructive hover:text-destructive"
                            disabled={deleteTemplateMutation.isPending}
                            onClick={() => void handleDelete(template)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
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
