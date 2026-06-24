import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { RoleService } from './role.service';
import CreateRoleDto from './dto/create-role.dto';
import SetRolePermissionsDto from './dto/set-role-permissions.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(
    @Body()
    createRoleDto: CreateRoleDto,
  ) {
    return this.roleService.create(createRoleDto);
  }

  @Put(':id/permissions')
  setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.roleService.setPermissions(id, dto.permissionNames);
  }
}
