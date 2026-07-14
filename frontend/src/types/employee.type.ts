import type { Department } from "./department.type";
import type { Position } from "./position.type";
import type { User } from "./user.type";
import type { WorkShift } from "./work-shift.type";

export type EmployeeGender = "MALE" | "FEMALE" | "OTHER";

export type EmployeeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "RESIGNED"
  | "ON_LEAVE"
  | "TERMINATED";

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
  department: Department;
  position: Position;
  users: User[];
  workShift: WorkShift | null;
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

export interface EmployeeProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  gender?: EmployeeGender;
  dob?: string;
  avatarUrl?: string;
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
