import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkPasswordResetDto } from './dto/bulk-password-reset.dto';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permissions('user:create')
  async createUser(@Body() body: CreateUserDto) {
    return {
      statusCode: 201,
      message: 'Tạo người dùng thành công',
      data: await this.userService.createUser(body),
    };
  }
  @Get()
  @Permissions('user:read')
  findAll(@Query() query: GetUsersDto) {
    return this.userService.findAll(query);
  }

  @Post('bulk-password-reset')
  @Permissions('user:reset-password')
  bulkPasswordReset(@Body() dto: BulkPasswordResetDto) {
    return this.userService.bulkSendPasswordReset(dto);
  }

  @Patch(':id/status')
  @Permissions('user:update-status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateStatus(id, dto.status);
  }

  @Patch(':id/roles')
  @Permissions('user:assign-role')
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
  ) {
    return this.userService.assignRoles(id, dto.roleIds);
  }
  @Patch(':id')
  @Permissions('user:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
