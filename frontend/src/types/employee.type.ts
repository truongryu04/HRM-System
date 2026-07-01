export interface EmployeeSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface EmployeeListResponse {
  data: EmployeeSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}