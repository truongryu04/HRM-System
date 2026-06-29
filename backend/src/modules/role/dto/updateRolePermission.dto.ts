import { IsArray, IsInt, ArrayUnique, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsInt()
  roleId!: number;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissionIds!: string[];
}
