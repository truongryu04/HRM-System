import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../employee.entity';

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob?: Date;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
