import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class LeaveBalanceStatusQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  leaveTypeId!: number;
}
