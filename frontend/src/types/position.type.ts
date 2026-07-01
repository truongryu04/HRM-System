export interface Position {
  id: number;
  code: string;
  name: string;
  level: string | null;
  description: string | null;
  status: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PositionRequest {
  code: string;
  name: string;
  level?: string;
  description?: string;
  status?: string;
}