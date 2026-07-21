import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsHalfDayIncrement } from '../../../common/validators/is-half-day-increment.decorator';
import { LeaveTypeCode } from '../enums/leave-type-code.enum';

export class UpdateLeaveTypeDto {
  @IsOptional()
  @IsEnum(LeaveTypeCode)
  code?: LeaveTypeCode;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsHalfDayIncrement()
  @Min(0)
  annualQuota?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
