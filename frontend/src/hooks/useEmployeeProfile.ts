import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
} from "../services/employee.api";

export const useEmployeeProfile = () =>
  useQuery({
    queryKey: ["employee-profile"],
    queryFn: getMyEmployeeProfile,
  });

export const useUpdateEmployeeProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyEmployeeProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(["employee-profile"], profile);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};
