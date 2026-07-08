import { PartialType } from '@nestjs/mapped-types';
import { CreateApprovalFlowStepDto } from './create-approval-flow-step.dto';

export class UpdateApprovalFlowStepDto extends PartialType(
  CreateApprovalFlowStepDto,
) {}

