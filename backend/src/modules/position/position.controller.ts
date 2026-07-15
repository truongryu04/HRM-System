import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
  @Post()
  @Permissions('position:create')
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }
  @Get()
  @Permissions('position:read')
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  @Permissions('position:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.findOne(id);
  }
  @Patch(':id')
  @Permissions('position:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionService.update(id, updatePositionDto);
  }
  @Delete(':id')
  @Permissions('position:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.remove(id);
  }
}
