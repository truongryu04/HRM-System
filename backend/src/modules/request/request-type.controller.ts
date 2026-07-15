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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { UpdateRequestTypeDto } from './dto/update-request-type.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('request-types')
export class RequestTypeController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Post()
  @Permissions('request-type:create')
  create(@Body() dto: CreateRequestTypeDto) {
    return this.requestConfigService.createRequestType(dto);
  }

  @Get()
  @Permissions('request-type:read')
  findAll() {
    return this.requestConfigService.findAllRequestTypes();
  }

  @Get(':id')
  @Permissions('request-type:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneRequestType(id);
  }

  @Patch(':id')
  @Permissions('request-type:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestTypeDto,
  ) {
    return this.requestConfigService.updateRequestType(id, dto);
  }

  @Delete(':id')
  @Permissions('request-type:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeRequestType(id);
  }
}
