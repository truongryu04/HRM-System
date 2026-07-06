import type { Role } from "./role.type";

export interface UserRoleSummary {
  id: number;
  name: string;
}

export interface UserEmployeeSummary {
  id: number;
  fullName: string;
}

export interface User {
  id: number;
  email: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  roles: Role[];
}

export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  status?: string;
  employeeId: number;
  roleIds: number[];
}
