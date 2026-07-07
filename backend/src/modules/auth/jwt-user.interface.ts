export interface JwtUser {
  id: number;
  email: string;
  employeeId: number;
  roles: string[];
  permissions: string[];
}
