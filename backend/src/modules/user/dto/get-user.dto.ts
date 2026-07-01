import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class GetUsersDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  role?: string;
  @IsOptional()
  status?: string;
  @IsOptional()
  linkedEmployee?: string;
}
