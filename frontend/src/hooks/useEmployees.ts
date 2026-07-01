import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../services/employee.api";
import type { EmployeeListResponse } from "@/types/employee.type";

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