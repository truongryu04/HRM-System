import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "../services/permission.api";

export const usePermissions = () =>
  useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });
