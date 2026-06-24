import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserStatus } from '../user-status.enum';
export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống ' })
  email!: string;

  @IsString()
  @Length(8, 255, { message: 'Mật khẩu phải có độ dài tối thiểu 8 ký tự' })
  password!: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  createdAt!: Date;

  updatedAt!: Date;
}
