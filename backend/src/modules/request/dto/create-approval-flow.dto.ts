import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateApprovalFlowDto {
  @IsInt()
  requestTypeId!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subtypeKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtypeLabel?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
