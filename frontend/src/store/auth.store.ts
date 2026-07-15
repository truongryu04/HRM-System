import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/auth.type";

interface AuthState {
  user: AuthUser | null;

  permissions: string[];

  accessToken: string | null;

  refreshToken: string | null;

  login: (
    user: AuthState["user"],
    permissions: string[],
    accessToken: string,
    refreshToken: string,
  ) => void;

  updateSession: (user: AuthUser, permissions: string[]) => void;

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

      updateSession: (user, permissions) => set({ user, permissions }),

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
