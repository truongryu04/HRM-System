import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LeaveTypeService } from './leave-type.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('leave-types')
export class LeaveTypeController {
  constructor(private readonly leaveTypeService: LeaveTypeService) {}

  @Post()
  @Permissions('leave-type:create')
  create(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveTypeService.create(dto);
  }

  @Get()
  @Permissions('leave-type:read')
  findAll() {
    return this.leaveTypeService.findAll();
  }

  @Get(':id')
  @Permissions('leave-type:read')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.leaveTypeService.findOne(id);
  }

  @Patch(':id')
  @Permissions('leave-type:update')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateLeaveTypeDto,
  ) {
    return this.leaveTypeService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('leave-type:delete')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.leaveTypeService.remove(id);
  }
}
