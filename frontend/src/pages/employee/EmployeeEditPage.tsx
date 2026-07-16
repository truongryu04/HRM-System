import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { EmployeeForm } from "./components/EmployeeForm";
import type { EmployeeCreateRequest } from "@/types/employee.type";

import { useDepartments } from "../../hooks/useDepartments";
import { usePositionOptions } from "../../hooks/usePositions";
import { useEmployee } from "../../hooks/useEmployees";
import { useUpdateEmployee } from "../../hooks/useEmployees";
import { getApiErrorMessage } from "../../utils/api-error";

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const employeeId = Number(id);

  // ===== FETCH DETAIL =====
  const { data: employee, isLoading: loadingEmployee } =
    useEmployee(employeeId);

  const { data: departments = [] } = useDepartments();
  const {
    data: positions = [],
    isLoading: loadingPositions,
    isError: positionsError,
  } = usePositionOptions();

  // ===== MUTATION =====
  const updateEmployeeMutation = useUpdateEmployee();

  // ===== SUBMIT =====
  const handleSubmit = async (payload: EmployeeCreateRequest) => {
    if (!employeeId) return;

    try {
      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        data: payload,
      });
      toast.success("Cập nhật nhân viên thành công");
      navigate("/employees");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Cập nhật nhân viên thất bại"));
    }
  };

  if (loadingEmployee || loadingPositions) {
    return <div>Đang tải dữ liệu nhân viên...</div>;
  }

  if (positionsError) {
    return <div>Không thể tải danh sách vị trí</div>;
  }

  if (!employee) {
    return <div>Không tìm thấy nhân viên</div>;
  }

  return (
    <EmployeeForm
      mode="edit"
      employee={employee}
      departments={departments}
      positions={positions}
      onSubmit={handleSubmit}
      loading={updateEmployeeMutation.isPending}
    />
  );
}
