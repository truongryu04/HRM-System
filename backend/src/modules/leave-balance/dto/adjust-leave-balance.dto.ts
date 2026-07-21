import { Type } from 'class-transformer';
import { IsNumber, IsString, NotEquals } from 'class-validator';

export class AdjustLeaveBalanceDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @NotEquals(0)
  amount!: number;

  @IsString()
  reason!: string;
}
