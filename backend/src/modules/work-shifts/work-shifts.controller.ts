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
import { WorkShiftsService } from './work-shifts.service';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { UpdateWorkShiftDto } from './dto/update-work-shift.dto';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('work-shifts')
export class WorkShiftsController {
  constructor(private readonly workShiftService: WorkShiftsService) {}
  @Post()
  @Permissions('work-shift:create')
  create(@Body() createWorkShiftDto: CreateWorkShiftDto) {
    return this.workShiftService.create(createWorkShiftDto);
  }

  @Get()
  @Permissions('work-shift:read')
  findAll() {
    return this.workShiftService.findAll();
  }

  @Get(':id')
  @Permissions('work-shift:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workShiftService.findOne(id);
  }

  @Patch(':id')
  @Permissions('work-shift:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkShiftDto,
  ) {
    return this.workShiftService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('work-shift:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workShiftService.remove(id);
  }
}
