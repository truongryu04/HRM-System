import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../services/auth.api";

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPassword,
  });
