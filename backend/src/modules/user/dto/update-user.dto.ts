import { IsEmail, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserStatus } from '../user-status.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsArray()
  roleIds?: number[];

  @IsOptional()
  employeeId?: number;
}
