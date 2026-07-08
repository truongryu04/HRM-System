import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateApprovalFlowDto {
  @IsInt()
  requestTypeId!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

