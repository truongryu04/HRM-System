import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../enums/request-status.enum';

export class RequestQueryDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requestTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @IsString()
  requestTypeCode?: string;
}
