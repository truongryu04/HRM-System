import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GrantDefaultLeaveBalanceDto {
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
  @Min(0)
  annualGranted!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
