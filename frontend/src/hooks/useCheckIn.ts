import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { attendanceApi } from "../services/attendance.api";

export const useCheckIn = (month: number, year: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.checkIn,

    onSuccess: () => {
      toast.success("Check-in thành công");

      queryClient.invalidateQueries({
        queryKey: ["attendance-today"],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance-calendar", month, year],
      });
    },
  });
};
