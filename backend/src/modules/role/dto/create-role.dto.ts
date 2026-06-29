import { IsOptional, IsString, Length } from 'class-validator';

export default class CreateRoleDto {
  @IsString()
  @Length(1, 255, { message: 'Tên vai trò không được để trống' })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
