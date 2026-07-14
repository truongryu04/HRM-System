export interface WorkShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  lateAfter: string;
  standardMinutes: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  lateAfter: string;
  standardMinutes: number;
  isActive: boolean;
  isDefault: boolean;
}
