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
import { DepartmentService } from './department.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}
  @Post()
  @Permissions('department:create')
  create(
    @Body()
    createDepartmentDto: CreateDepartmentDto,
  ) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @Permissions('department:read')
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @Permissions('department:read')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.departmentService.findOne(id);
  }

  @Put(':id')
  @Permissions('department:update')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Permissions('department:delete')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.departmentService.remove(id);
  }
}
