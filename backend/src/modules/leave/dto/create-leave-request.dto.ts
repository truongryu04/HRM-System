import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsInt()
  employeeId!: number;

  @IsInt()
  leaveTypeId!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  attachment?: string;
}
