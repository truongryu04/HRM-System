import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const initialAuthState = {
  user: null,
  permissions: [],
  accessToken: null,
  refreshToken: null,
} satisfies Pick<
  AuthState,
  "user" | "permissions" | "accessToken" | "refreshToken"
>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialAuthState,

      login: (user, permissions, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        set({ user, permissions, accessToken, refreshToken });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set(initialAuthState);
      },
    }),
    {
      name: "hrm-auth",
      version: 1,
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
