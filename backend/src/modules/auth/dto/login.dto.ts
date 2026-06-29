import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export default class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email không được để trống ' })
  email!: string;

  @IsString()
  @Length(8, 255, { message: 'Mật khẩu phải có độ dài tối thiểu 8 ký tự' })
  password!: string;
}
