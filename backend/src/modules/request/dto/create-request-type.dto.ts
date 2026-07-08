import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRequestTypeDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  handlerKey?: string;
}

