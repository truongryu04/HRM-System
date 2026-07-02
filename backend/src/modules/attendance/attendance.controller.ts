import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { Req } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
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
}
