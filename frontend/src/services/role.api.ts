import { apiClient } from "./api-client";

export const getRoles = async () => {
  const response = await apiClient.get("/roles");

  return response.data;
};
interface UpdateRolePermissionsDto {
  roleId: number;
  permissionIds: string[];
}
export const updateRolePermissions = async (
  roles: UpdateRolePermissionsDto[],
) => {
  const response = await apiClient.put("/roles/permissions", roles);

  return response.data;
};
