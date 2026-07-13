import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt-user.interface';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveRequestService } from './leave-request.service';

@UseGuards(JwtAuthGuard)
@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  create(@Body() dto: CreateLeaveRequestDto, @CurrentUser() user: JwtUser) {
    return this.leaveRequestService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.leaveRequestService.findAll();
  }

  @Get('my')
  findMy(@CurrentUser() user: JwtUser) {
    return this.leaveRequestService.findMy(user);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.leaveRequestService.findByEmployee(employeeId);
  }

  @Get('by-request/:requestId')
  findByRequestId(@Param('requestId', ParseIntPipe) requestId: number) {
    return this.leaveRequestService.findByRequestId(requestId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveRequestDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.leaveRequestService.update(id, dto, user);
  }
}
