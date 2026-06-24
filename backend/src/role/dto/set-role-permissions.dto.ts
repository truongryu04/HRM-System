import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsString,
  Length,
} from 'class-validator';

export default class SetRolePermissionsDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách permission không được rỗng' })
  @ArrayUnique({ message: 'Permission name bị trùng' })
  @IsString({ each: true })
  @Length(1, 255, { each: true })
  permissionNames!: string[];
}
