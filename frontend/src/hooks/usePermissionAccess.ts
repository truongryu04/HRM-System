import type { PermissionCode } from "../constants/permissions";
import { useAuthStore } from "../store/auth.store";
import {
  hasAnyPermission,
  hasEveryPermission,
  hasPermission,
} from "../utils/permission";

export function usePermissionAccess() {
  const permissions = useAuthStore((state) => state.permissions);

  return {
    permissions,
    can: (permission: PermissionCode) =>
      hasPermission(permissions, permission),
    canAny: (requiredPermissions: readonly PermissionCode[]) =>
      hasAnyPermission(permissions, requiredPermissions),
    canAll: (requiredPermissions: readonly PermissionCode[]) =>
      hasEveryPermission(permissions, requiredPermissions),
  };
}
