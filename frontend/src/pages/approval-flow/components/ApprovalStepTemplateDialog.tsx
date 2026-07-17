import { useState } from "react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import type { Position } from "@/types/position.type";
import type { Role } from "@/types/role.type";
import type {
  ApprovalStepTemplate,
  ApproverType,
  CreateApprovalStepTemplateRequest,
} from "@/types/request-config.type";
import type { User } from "@/types/user.type";
import { approverTypeOptions } from "../approval-flow.constants";

interface ApprovalStepTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ApprovalStepTemplate | null;
  roles: Role[];
  positions: Array<Pick<Position, "id" | "code" | "name">>;
  users: User[];
  loading: boolean;
  onSubmit: (payload: CreateApprovalStepTemplateRequest) => Promise<void>;
}

function stringifyCondition(condition?: Record<string, unknown> | null) {
  return condition ? JSON.stringify(condition, null, 2) : "";
}

export function ApprovalStepTemplateDialog({
  open,
  onOpenChange,
  template,
  roles,
  positions,
  users,
  loading,
  onSubmit,
}: ApprovalStepTemplateDialogProps) {
  const [stepName, setStepName] = useState(template?.stepName ?? "");
  const [approverType, setApproverType] = useState<ApproverType>(
    template?.approverType ?? "DIRECT_MANAGER",
  );
  const [roleCode, setRoleCode] = useState(template?.roleCode ?? "");
  const [positionCode, setPositionCode] = useState(
    template?.positionCode ?? "",
  );
  const [specificUserId, setSpecificUserId] = useState(
    template?.specificUser?.id ? String(template.specificUser.id) : "",
  );
  const [conditionText, setConditionText] = useState(
    stringifyCondition(template?.condition),
  );

  const handleSubmit = async () => {
    if (!stepName.trim()) {
      toast.error("Vui lòng nhập tên bước duyệt");
      return;
    }

    if (approverType === "ROLE" && !roleCode) {
      toast.error("Vui lòng chọn vai trò duyệt");
      return;
    }

    if (approverType === "POSITION" && !positionCode) {
      toast.error("Vui lòng chọn vị trí duyệt");
      return;
    }

    if (approverType === "SPECIFIC_USER" && !specificUserId) {
      toast.error("Vui lòng chọn người duyệt");
      return;
    }

    let condition: Record<string, unknown> | undefined;
    const trimmedCondition = conditionText.trim();

    if (trimmedCondition) {
      try {
        const parsedCondition = JSON.parse(trimmedCondition) as unknown;

        if (
          !parsedCondition ||
          Array.isArray(parsedCondition) ||
          typeof parsedCondition !== "object"
        ) {
          toast.error("Condition phải là một JSON object");
          return;
        }

        condition = parsedCondition as Record<string, unknown>;
      } catch {
        toast.error("Condition chưa đúng định dạng JSON");
        return;
      }
    } else if (template?.condition) {
      condition = {};
    }

    await onSubmit({
      stepName: stepName.trim(),
      approverType,
      roleCode: approverType === "ROLE" ? roleCode : "",
      positionCode: approverType === "POSITION" ? positionCode : "",
      specificUserId:
        approverType === "SPECIFIC_USER" ? Number(specificUserId) : 0,
      condition,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {template ? "Sửa mẫu bước duyệt" : "Tạo mẫu bước duyệt"}
          </DialogTitle>
          <DialogDescription>
            Tạo trước các bước duyệt để tái sử dụng khi cấu hình flow.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="approval-template-name">Tên bước</Label>
            <Input
              id="approval-template-name"
              value={stepName}
              onChange={(event) => setStepName(event.target.value)}
              placeholder="Trưởng phòng duyệt"
            />
          </div>

          <div className="space-y-2">
            <Label>Kiểu người duyệt</Label>
            <Select
              value={approverType}
              onValueChange={(value) => setApproverType(value as ApproverType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {approverTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {approverType === "ROLE" ? (
            <div className="space-y-2">
              <Label>Role code</Label>
              <Select value={roleCode} onValueChange={setRoleCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn role code" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {approverType === "POSITION" ? (
            <div className="space-y-2">
              <Label>Position code</Label>
              <Select value={positionCode} onValueChange={setPositionCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn position code" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.code}>
                      {position.code} - {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {approverType === "SPECIFIC_USER" ? (
            <div className="space-y-2">
              <Label>Người duyệt cụ thể</Label>
              <Select value={specificUserId} onValueChange={setSpecificUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.employee?.fullName
                        ? `${user.employee.fullName} (${user.email})`
                        : user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="approval-template-condition">Condition</Label>
            <Textarea
              id="approval-template-condition"
              value={conditionText}
              onChange={(event) => setConditionText(event.target.value)}
              placeholder='{"minDays": 3}'
              className="min-h-28 font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={loading}
            variant="primary"
          >
            {loading ? "Đang lưu..." : "Lưu mẫu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
