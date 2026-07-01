import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../services/department.api";
import type { Department } from "@/types/department.type";

export const useDepartments = () => {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });
};