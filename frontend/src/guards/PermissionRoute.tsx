import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import type { PermissionCode } from "../constants/permissions";
import { usePermissionAccess } from "../hooks/usePermissionAccess";

type PermissionRouteProps = {
  anyPermissions?: readonly PermissionCode[];
  allPermissions?: readonly PermissionCode[];
  children?: ReactNode;
};

export default function PermissionRoute({
  anyPermissions,
  allPermissions,
  children,
}: PermissionRouteProps) {
  const location = useLocation();
  const { canAll, canAny } = usePermissionAccess();

  const allowed =
    (!anyPermissions?.length || canAny(anyPermissions)) &&
    (!allPermissions?.length || canAll(allPermissions));

  if (!allowed) {
    return (
      <Navigate
        to="/forbidden"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children ?? <Outlet />;
}
