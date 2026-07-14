import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useCreateLeaveRequest,
  useLeaveTypes,
} from "../../hooks/useLeaveRequests";
import { useRequestTypes } from "../../hooks/useRequestTypes";
import { useAuthStore } from "../../store/auth.store";
import type { CreateLeaveRequest } from "@/types/leave.type";
import { RequestForm } from "./components/RequestForm";
import { getEmployeeIdFromAccessToken } from "./request.helpers";
import { getApiErrorMessage } from "../../utils/api-error";

export default function RequestCreatePage() {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const employeeId = authUser?.employeeId ?? getEmployeeIdFromAccessToken();
  const { data: requestTypes = [] } = useRequestTypes();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const createLeaveRequestMutation = useCreateLeaveRequest();

  const handleSubmit = async (payload: CreateLeaveRequest) => {
    try {
      await createLeaveRequestMutation.mutateAsync(payload);
      toast.success("Tạo yêu cầu thành công");
      navigate("/requests/my");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Tạo yêu cầu thất bại"));
    }
  };

  return (
    <RequestForm
      employeeId={employeeId}
      requestTypes={requestTypes.filter(
        (requestType) => requestType.isActive !== false,
      )}
      leaveTypes={leaveTypes.filter(
        (leaveType) => !leaveType.isDeleted && leaveType.isActive !== false,
      )}
      loading={createLeaveRequestMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
