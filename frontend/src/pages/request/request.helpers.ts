interface JwtPayload {
  sub?: number;
  employeeId?: number;
}

export function getEmployeeIdFromAccessToken() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalizedPayload)) as JwtPayload;

    return decoded.employeeId ?? null;
  } catch {
    return null;
  }
}
import { useAuthStore } from "../../store/auth.store";
