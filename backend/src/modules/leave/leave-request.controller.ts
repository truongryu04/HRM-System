import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequestService } from './leave-request.service';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';

@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  create(
    @Body()
    dto: CreateLeaveRequestDto,
  ) {
    return this.leaveRequestService.create(dto);
  }
  @Get()
  findAll() {
    return this.leaveRequestService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.leaveRequestService.findOne(id);
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param('employeeId', ParseIntPipe)
    employeeId: number,
  ) {
    return this.leaveRequestService.findByEmployee(employeeId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateLeaveRequestDto,
  ) {
    return this.leaveRequestService.update(id, dto);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.leaveRequestService.cancel(id);
  }
}
