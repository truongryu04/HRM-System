import { IsInt, IsOptional } from 'class-validator';

export class UpdateApprovalFlowStepFromTemplateDto {
  @IsInt()
  templateId!: number;

  @IsOptional()
  @IsInt()
  stepOrder?: number;
}
