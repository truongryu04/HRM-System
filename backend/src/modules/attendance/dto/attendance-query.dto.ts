import { IsNumberString, IsOptional } from 'class-validator';

export class AttendanceQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @IsOptional()
  search?: string;

  @IsOptional()
  departmentId?: string;

  @IsOptional()
  employeeId?: string;

  @IsOptional()
  fromDate?: string;

  @IsOptional()
  date?: string;

  @IsOptional()
  positionId?: string;
}
