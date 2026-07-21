import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { LeaveTypeCode } from '../enums/leave-type-code.enum';

export class CreateLeaveTypeDto {
  @IsEnum(LeaveTypeCode)
  code!: LeaveTypeCode;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  annualQuota?: number;
}
