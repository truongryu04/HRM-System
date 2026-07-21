import { Type } from 'class-transformer';
import { IsDivisibleBy, IsNumber, IsString, NotEquals } from 'class-validator';

export class AdjustLeaveBalanceDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsDivisibleBy(0.5)
  @NotEquals(0)
  amount!: number;

  @IsString()
  reason!: string;
}
