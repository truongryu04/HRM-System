import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services/auth.api";

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPassword,
  });
