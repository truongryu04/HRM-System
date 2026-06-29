import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../services/role.api";

export const useRoles = () =>
  useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
