import { apiClient } from "./api-client";
import type { Position, PositionRequest } from "@/types/position.type";

export const getPositions = async () => {
  const { data } = await apiClient.get("/positions");

  return data as Position[];
};

export const createPosition = async (payload: PositionRequest) => {
  const { data } = await apiClient.post("/positions", payload);

  return data as Position;
};

export const updatePosition = async (
  id: number,
  payload: PositionRequest,
) => {
  const { data } = await apiClient.patch(`/positions/${id}`, payload);

  return data as Position;
};

export const deletePosition = async (id: number) => {
  const { data } = await apiClient.delete(`/positions/${id}`);

  return data;
};