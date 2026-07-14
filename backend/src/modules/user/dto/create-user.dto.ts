import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserStatus } from '../user-status.enum';
export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống ' })
  email!: string;

  @IsOptional()
  @IsString()
  @Length(8, 255, { message: 'Mật khẩu phải có độ dài tối thiểu 8 ký tự' })
  password?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsNumber()
  @IsNotEmpty({ message: 'EmployeeId không được để trống' })
  employeeId!: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách roles không được rỗng' })
  @ArrayUnique({ message: 'RoleId bị trùng' })
  roleIds!: number[];
}
