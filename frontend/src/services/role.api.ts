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

export const updateRole = async (
  id: number,
  data: {
    name: string;
    description: string;
  },
) => {
  const response = await apiClient.put(`/roles/${id}`, data);

  return response.data;
};

export const createRole = async (data: {
  name: string;
  description: string;
}) => {
  const response = await apiClient.post("/roles", data);

  return response.data;
};

export const deleteRole = async (id: number) => {
  const response = await apiClient.delete(`/roles/${id}`);

  return response.data;
};
