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
import { WorkShiftsService } from './work-shifts.service';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { UpdateWorkShiftDto } from './dto/update-work-shift.dto';

@Controller('work-shifts')
export class WorkShiftsController {
  constructor(private readonly workShiftService: WorkShiftsService) {}
  @Post()
  create(@Body() createWorkShiftDto: CreateWorkShiftDto) {
    return this.workShiftService.create(createWorkShiftDto);
  }

  @Get()
  findAll() {
    return this.workShiftService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workShiftService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkShiftDto,
  ) {
    return this.workShiftService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workShiftService.remove(id);
  }
}
