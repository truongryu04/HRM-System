import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
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

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  removeAvatar?: boolean;
}
