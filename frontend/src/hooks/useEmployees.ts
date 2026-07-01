import { getEmployees } from "../services/employee.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  EmployeeListResponse,
  EmployeeSummary,
  EmployeeUpdateRequest,
  EmployeeCreateRequest,
} from "../types/employee.type";
import {
  getEmployee,
  updateEmployee,
  createEmployee,
} from "../services/employee.api";
export const useEmployees = (
  params?: { page?: number; limit?: number },
  enabled = true,
) => {
  return useQuery<EmployeeListResponse>({
    queryKey: ["employees", params],
    queryFn: () => getEmployees(params),
    enabled,
  });
};

export const useEmployee = (id: number, enabled = true) => {
  return useQuery<EmployeeSummary>({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeUpdateRequest }) =>
      updateEmployee(id, data),

    onSuccess: (_, variables) => {
      // refresh detail + list
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({
        queryKey: ["employee", variables.id],
      });
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeCreateRequest) => createEmployee(payload),

    onSuccess: () => {
      // refresh danh sách nhân viên
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
  });
};
