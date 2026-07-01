export interface DepartmentManagerSummary {
  id: number;
  fullName: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: string;
  manager: DepartmentManagerSummary | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentRequest {
  code: string;
  name: string;
  description?: string;
  status?: string;
  managerId?: number;
}