export interface RequestType {
  id: number;
  code: string;
  name: string;
  handlerKey: string;
  isActive: boolean;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestTypeRequest {
  code: string;
  name: string;
  handlerKey: string;
  isActive: boolean;
  description?: string;
}
