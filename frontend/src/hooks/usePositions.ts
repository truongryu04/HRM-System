import { useQuery } from "@tanstack/react-query";
import {
  getPositionOptions,
  getPositions,
  type PositionOption,
} from "../services/position.api";
import type { Position } from "@/types/position.type";

export const usePositions = (enabled = true) => {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: getPositions,
    enabled,
  });
};

export const usePositionOptions = () => {
  return useQuery<PositionOption[]>({
    queryKey: ["positions", "options"],
    queryFn: getPositionOptions,
  });
};
