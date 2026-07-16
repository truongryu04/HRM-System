import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../services/role.api";
import type { Role } from "@/types/role.type";

export const useRoles = (enabled = true) =>
  useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
    enabled,
  });
