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

@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
  @Post()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }
  @Get()
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.findOne(id);
  }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionService.update(id, updatePositionDto);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.remove(id);
  }
}
