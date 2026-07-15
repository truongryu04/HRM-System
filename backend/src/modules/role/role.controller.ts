import { UpdateRolePermissionsDto } from './dto/updateRolePermission.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleService } from './role.service';
import CreateRoleDto from './dto/create-role.dto';
import SetRolePermissionsDto from './dto/set-role-permissions.dto';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions('role:create')
  create(
    @Body()
    createRoleDto: CreateRoleDto,
  ) {
    return this.roleService.create(createRoleDto);
  }

  @Put(':id/permissions')
  @Permissions('role:permission')
  setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.roleService.setPermissions(id, dto.permissionNames);
  }
  @Put('/permissions')
  @Permissions('role:permission')
  updateRolePermissions(@Body() body: UpdateRolePermissionsDto[]) {
    return this.roleService.updatePermissions(body);
  }
  @Get()
  @Permissions('role:read')
  async findAll() {
    return this.roleService.findAll();
  }
  @Put(':id')
  @Permissions('role:update')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateRoleDto,
  ) {
    return this.roleService.updateRole(id, body);
  }
  @Delete(':id')
  @Permissions('role:delete')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.deleteRole(id);
  }
}
