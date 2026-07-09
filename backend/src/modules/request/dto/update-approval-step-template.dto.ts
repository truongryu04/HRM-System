import { PartialType } from '@nestjs/mapped-types';
import { CreateApprovalStepTemplateDto } from './create-approval-step-template.dto';

export class UpdateApprovalStepTemplateDto extends PartialType(
  CreateApprovalStepTemplateDto,
) {}
