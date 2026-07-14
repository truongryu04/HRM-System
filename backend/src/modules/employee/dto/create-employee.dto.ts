import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeStatus, Gender } from '../employee.entity';

export class CreateEmployeeDto {
  @IsString()
  employeeCode!: string;

  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dob!: Date;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsDateString()
  joinDate!: Date;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsInt()
  @Type(() => Number)
  departmentId!: number;

  @IsInt()
  @Type(() => Number)
  positionId!: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  workShiftId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  managerId?: number;
}
