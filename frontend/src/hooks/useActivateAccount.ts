import { useMutation } from "@tanstack/react-query";
import { activateAccount } from "../services/auth.api";

export const useActivateAccount = () => {
  return useMutation({
    mutationFn: activateAccount,
  });
};
