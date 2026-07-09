import { IsInt, IsOptional } from 'class-validator';

export class CreateApprovalFlowStepFromTemplateDto {
  @IsInt()
  templateId!: number;

  @IsOptional()
  @IsInt()
  stepOrder?: number;
}
