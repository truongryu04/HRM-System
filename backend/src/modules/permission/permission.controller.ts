import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreatePermissionDto } from '../permission/dto/create-permission.dto';
import { PermissionService } from './permission.service';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
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

  @Post('bulk')
  createMany(
    @Body(new ParseArrayPipe({ items: CreatePermissionDto }))
    createPermissionDtos: CreatePermissionDto[],
  ) {
    return this.permissionsService.createMany(createPermissionDtos);
  }

  @Get()
  @Permissions('permission:read')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Put(':id')
  @Permissions('permission:update')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updateName(id, updatePermissionDto);
  }
}
