export interface WorkShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  lateAfter: string;
  standardMinutes: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
