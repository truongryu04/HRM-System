export type EmployeeGender = "MALE" | "FEMALE" | "OTHER";

export type EmployeeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "RESIGNED"
  | "ON_LEAVE"
  | "TERMINATED";
export interface EmployeeDepartmentSummary {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  status?: string;
}

export interface EmployeePositionSummary {
  id: number;
  code: string;
  name: string;
  level: string | null;
  description?: string | null;
  status?: string;
}

export interface EmployeeSummary {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  gender: EmployeeGender;
  dob: string;
  joinDate: string;
  status: EmployeeStatus;
  avatarUrl: string | null;
  department: EmployeeDepartmentSummary;
  position: EmployeePositionSummary;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface EmployeeListResponse {
  data: EmployeeSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeUpdateRequest {
  employeeCode?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: EmployeeGender;
  dob?: string;
  joinDate?: string;
  status?: EmployeeStatus;
  avatarUrl?: string;
  departmentId?: number;
  positionId?: number;
}

export interface EmployeeCreateRequest {
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  gender: EmployeeGender;
  dob: string;
  joinDate: string;
  status?: EmployeeStatus;
  avatarUrl?: string;
  departmentId: number;
  positionId: number;
}
