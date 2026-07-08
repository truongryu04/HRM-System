import { PartialType } from '@nestjs/mapped-types';
import { CreateApprovalFlowDto } from './create-approval-flow.dto';

export class UpdateApprovalFlowDto extends PartialType(CreateApprovalFlowDto) {}

