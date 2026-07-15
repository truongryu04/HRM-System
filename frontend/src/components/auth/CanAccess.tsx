import type { ReactNode } from "react";

import type { PermissionCode } from "../../constants/permissions";
import { usePermissionAccess } from "../../hooks/usePermissionAccess";

type CanAccessProps = {
  permission?: PermissionCode;
  anyPermissions?: readonly PermissionCode[];
  allPermissions?: readonly PermissionCode[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function CanAccess({
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  children,
}: CanAccessProps) {
  const { can, canAll, canAny } = usePermissionAccess();

  const allowed =
    (!permission || can(permission)) &&
    (!anyPermissions?.length || canAny(anyPermissions)) &&
    (!allPermissions?.length || canAll(allPermissions));

  return allowed ? children : fallback;
}
