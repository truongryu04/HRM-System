export function hasPermission(userPermissions: string[], permission: string) {
  return userPermissions.includes(permission);
}

export function hasEveryPermission(
  userPermissions: string[],
  requiredPermissions: readonly string[],
) {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
}

export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: readonly string[],
) {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}
