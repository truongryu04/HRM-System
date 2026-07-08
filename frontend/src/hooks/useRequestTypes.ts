import { useQuery } from "@tanstack/react-query";
import { getRequestTypes } from "../services/request-type.api";
import type { RequestType } from "@/types/request-type.type";

export const requestTypesQueryKey = ["request-types"] as const;

export const useRequestTypes = () => {
  return useQuery<RequestType[]>({
    queryKey: requestTypesQueryKey,
    queryFn: getRequestTypes,
  });
};
