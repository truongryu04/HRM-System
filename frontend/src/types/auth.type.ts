export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      employeeId?: number;
      roles: string[];
    };
    permissions: string[];
    access_token: string;
    refresh_token: string;
  };
}
