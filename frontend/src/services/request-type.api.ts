import { apiClient } from "./api-client";
import type {
  RequestType,
  RequestTypeRequest,
} from "@/types/request-type.type";

export const getRequestTypes = async () => {
  const { data } = await apiClient.get("/request-types");

  return data as RequestType[];
};

export const createRequestType = async (payload: RequestTypeRequest) => {
  const { data } = await apiClient.post("/request-types", payload);

  return data as RequestType;
};

export const updateRequestType = async (
  id: number,
  payload: RequestTypeRequest,
) => {
  const { data } = await apiClient.patch(`/request-types/${id}`, payload);

  return data as RequestType;
};

export const deleteRequestType = async (id: number) => {
  const { data } = await apiClient.delete(`/request-types/${id}`);

  return data;
};
