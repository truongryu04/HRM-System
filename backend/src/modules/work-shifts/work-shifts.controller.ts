import { Body, Controller, Post } from '@nestjs/common';
import { WorkShiftsService } from './work-shifts.service';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';

@Controller('work-shifts')
export class WorkShiftsController {
  constructor(private readonly workShiftService: WorkShiftsService) {}
  @Post()
  create(@Body() createWorkShiftDto: CreateWorkShiftDto) {
    return this.workShiftService.create(createWorkShiftDto);
  }
}
