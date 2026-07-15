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
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permission.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveRequestService } from './leave-request.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @Permissions('request:create')
  create(@Body() dto: CreateLeaveRequestDto, @CurrentUser() user: JwtUser) {
    return this.leaveRequestService.create(dto, user);
  }

  @Get()
  @Permissions('request:read-all')
  findAll() {
    return this.leaveRequestService.findAll();
  }

  @Get('my')
  findMy(@CurrentUser() user: JwtUser) {
    return this.leaveRequestService.findMy(user);
  }

  @Get('employee/:employeeId')
  @Permissions('request:read')
  findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.leaveRequestService.findByEmployee(employeeId);
  }

  @Get('by-request/:requestId')
  @Permissions('request:read')
  findByRequestId(@Param('requestId', ParseIntPipe) requestId: number) {
    return this.leaveRequestService.findByRequestId(requestId);
  }

  @Get(':id')
  @Permissions('request:read')
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
