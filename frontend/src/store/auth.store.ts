import { create } from "zustand";

interface AuthState {
  user: {
    id: number;
    email: string;
    employeeId?: number;
    roles: string[];
  } | null;

  permissions: string[];

  accessToken: string | null;

  refreshToken: string | null;

  login: (
    user: AuthState["user"],
    permissions: string[],
    accessToken: string,
    refreshToken: string,
  ) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  permissions: [],
  accessToken: null,
  refreshToken: null,

  login: (user, permissions, accessToken, refreshToken) =>
    set({
      user,
      permissions,
      accessToken,
      refreshToken,
    }),

  logout: () =>
    set({
      user: null,
      permissions: [],
      accessToken: null,
      refreshToken: null,
    }),
}));
