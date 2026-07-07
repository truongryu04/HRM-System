import { IsString } from 'class-validator';

export class RejectLeaveRequestDto {
  @IsString()
  reason!: string;
}
