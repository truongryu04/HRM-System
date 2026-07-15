import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";

export function useCurrentSession() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["auth", "me", accessToken],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
