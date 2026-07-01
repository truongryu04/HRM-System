import { useQuery } from "@tanstack/react-query";
import { getPositions } from "../services/position.api";
import type { Position } from "@/types/position.type";

export const usePositions = () => {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: getPositions,
  });
};