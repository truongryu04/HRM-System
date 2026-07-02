import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { AttendanceCalendarDto } from './dto/attendance-calendar.dto';
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.checkIn(user.employeeId);
  }

  @Post('check-out')
  checkOut(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.checkOut(user.employeeId);
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser() user: JwtPayload,
    @Query() query: AttendanceCalendarDto,
  ) {
    return this.attendanceService.getCalendar(
      user.employeeId,
      query.month,
      query.year,
    );
  }
}
