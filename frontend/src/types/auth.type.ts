export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  employeeId?: number;
  roles: string[];
}

export interface CurrentSession {
  user: AuthUser;
  permissions: string[];
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    user: AuthUser;
    permissions: string[];
    access_token: string;
    refresh_token: string;
  };
}
