import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreatePermissionDto } from '../permission/dto/create-permission.dto';
import { PermissionService } from './permission.service';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionsService: PermissionService) {}

  @Post()
  create(
    @Body()
    createPermissionDto: CreatePermissionDto,
  ) {
    return this.permissionsService.create(createPermissionDto);
  }
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }
}
