import { EmployeeForm } from "./components/EmployeeForm";
import { useDepartments } from "../../hooks/useDepartments";
import { usePositions } from "../../hooks/usePositions";
import { useCreateEmployee } from "../../hooks/useEmployees";
import type { EmployeeCreateRequest } from "@/types/employee.type";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../utils/api-error";
export default function EmployeeCreatePage() {
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();

  const createEmployeeMutation = useCreateEmployee();

  const navigate = useNavigate();
  const handleSubmit = async (payload: EmployeeCreateRequest) => {
    try {
      await createEmployeeMutation.mutateAsync(payload);
      toast.success("Tạo nhân viên thành công");
      navigate("/employees");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Tạo nhân viên thất bại"));
    }
  };
  return (
    <EmployeeForm
      mode="create"
      employee={null}
      departments={departments}
      positions={positions}
      onSubmit={handleSubmit}
      loading={createEmployeeMutation.isPending}
    />
  );
}
