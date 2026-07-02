export interface JwtPayload {
  sub: string;
  email: string;
  employeeId: number;
  roles: string[];
  permissions: string[];
}
