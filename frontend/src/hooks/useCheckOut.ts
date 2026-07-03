import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { attendanceApi } from "../services/attendance.api";

export const useCheckOut = (month: number, year: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.checkOut,

    onSuccess: () => {
      toast.success("Check-out thành công");

      queryClient.invalidateQueries({
        queryKey: ["attendance-today"],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance-calendar", month, year],
      });
    },
  });
};
