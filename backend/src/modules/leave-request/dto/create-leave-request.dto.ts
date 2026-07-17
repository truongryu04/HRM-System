import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveSession } from '../enums/leave-session.enum';

export class CreateLeaveRequestDto {
  @IsOptional()
  @IsInt()
  employeeId?: number;

  @IsInt()
  leaveTypeId!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsEnum(LeaveSession)
  session?: LeaveSession;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  attachment?: string;
}
