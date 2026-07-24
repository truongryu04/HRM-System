import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AttendanceCalendarDto } from './dto/attendance-calendar.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import type { JwtUser } from '../auth/jwt-user.interface';
import { Permissions } from '../auth/decorators/permission.decorator';
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@CurrentUser('employeeId') employeeId: number | undefined) {
    return this.attendanceService.checkIn(employeeId);
  }

  @Post('check-out')
  checkOut(@CurrentUser('employeeId') employeeId: number | undefined) {
    return this.attendanceService.checkOut(employeeId);
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser('employeeId') employeeId: number | undefined,
    @Query() query: AttendanceCalendarDto,
  ) {
    return this.attendanceService.getCalendar(
      employeeId,
      query.month,
      query.year,
    );
  }
  @Get('today')
  getToday(@CurrentUser('employeeId') employeeId: number | undefined) {
    return this.attendanceService.getToday(employeeId);
  }

  @Get('dashboard')
  @Permissions('attendance:read-dashboard')
  getDashboard(@CurrentUser() user: JwtUser) {
    return this.attendanceService.getDashboard(user);
  }

  @Get()
  @Permissions('attendance:read')
  findAll(@CurrentUser() user: JwtUser, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query, user);
  }

  @Patch(':id')
  @Permissions('attendance:update')
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto, user);
  }
}
