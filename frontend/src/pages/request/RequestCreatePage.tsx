import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useCreateLeaveRequest,
  useLeaveTypes,
} from "../../hooks/useLeaveRequests";
import { useAuthStore } from "../../store/auth.store";
import type { CreateLeaveRequest } from "@/types/leave.type";
import { RequestForm } from "./components/RequestForm";
import { getEmployeeIdFromAccessToken } from "./request.helpers";

export default function RequestCreatePage() {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const employeeId = authUser?.employeeId ?? getEmployeeIdFromAccessToken();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const createLeaveRequestMutation = useCreateLeaveRequest();

  const handleSubmit = async (payload: CreateLeaveRequest) => {
    await createLeaveRequestMutation.mutateAsync(payload);

    toast.success("Tạo yêu cầu thành công");
    navigate("/requests/my");
  };

  return (
    <RequestForm
      employeeId={employeeId}
      leaveTypes={leaveTypes.filter(
        (leaveType) => !leaveType.isDeleted && leaveType.isActive !== false,
      )}
      loading={createLeaveRequestMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
