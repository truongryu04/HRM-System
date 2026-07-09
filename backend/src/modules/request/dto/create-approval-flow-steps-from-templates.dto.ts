import { ArrayNotEmpty, IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateApprovalFlowStepsFromTemplatesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  templateIds!: number[];

  @IsOptional()
  @IsInt()
  startStepOrder?: number;
}
