import { IsString, Length, Matches } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @Matches(/\S/, { message: 'Tên permission không được để trống' })
  @Length(1, 255, {
    message: 'Tên permission không được để trống và tối đa 255 ký tự',
  })
  name!: string;
}
