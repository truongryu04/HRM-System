import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApproverType } from '../enums/approver-type.enum';

export class CreateApprovalFlowStepDto {
  @IsInt()
  stepOrder!: number;

  @IsString()
  stepName!: string;

  @IsEnum(ApproverType)
  approverType!: ApproverType;

  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsString()
  positionCode?: string;

  @IsOptional()
  @IsInt()
  specificUserId?: number;

  @IsOptional()
  @IsObject()
  condition?: Record<string, unknown>;
}
