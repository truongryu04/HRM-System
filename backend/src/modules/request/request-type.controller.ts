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
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { UpdateRequestTypeDto } from './dto/update-request-type.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard)
@Controller('request-types')
export class RequestTypeController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Post()
  create(@Body() dto: CreateRequestTypeDto) {
    return this.requestConfigService.createRequestType(dto);
  }

  @Get()
  findAll() {
    return this.requestConfigService.findAllRequestTypes();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneRequestType(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestTypeDto,
  ) {
    return this.requestConfigService.updateRequestType(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeRequestType(id);
  }
}
