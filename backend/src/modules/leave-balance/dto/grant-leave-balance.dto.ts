import { Type } from 'class-transformer';
import {
  IsInt,
  IsDivisibleBy,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GrantLeaveBalanceDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  leaveTypeId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsDivisibleBy(0.5)
  @Min(0)
  annualGranted!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
