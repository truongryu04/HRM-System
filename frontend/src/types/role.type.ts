import type { Permission } from "./permission.type";

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}
