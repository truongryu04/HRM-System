import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly employeeService: EmployeeService,
  ) {}
  private timeStringToDate(baseDate: Date, time: string): Date {
    const [hour, minute] = time.split(':').map(Number);

    const result = new Date(baseDate);

    result.setHours(hour, minute, 0, 0);

    return result;
  }
  async checkIn(employeeId: number) {
    const employee = await this.employeeService.findOne(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const now = new Date();

    const attendanceDate = now.toISOString().split('T')[0];

    const existedAttendance = await this.attendanceRepository.findOne({
      where: {
        employee: {
          id: employeeId,
        },
        attendanceDate,
      },
      relations: {
        employee: true,
      },
    });

    if (existedAttendance) {
      throw new BadRequestException('Already checked in today');
    }

    const [lateHour, lateMinute] = employee.workShift.lateAfter
      .split(':')
      .map(Number);

    const lateAfterTime = new Date(now);

    lateAfterTime.setHours(lateHour, lateMinute, 0, 0);

    const isLate = now > lateAfterTime;

    let lateMinutes = 0;

    if (isLate) {
      lateMinutes = Math.floor(
        (now.getTime() - lateAfterTime.getTime()) / 60000,
      );
    }

    const attendance = this.attendanceRepository.create({
      employee,
      attendanceDate,
      checkInTime: now,
      isLate,
      lateMinutes,
    });

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Check-in successful',
      checkInTime: attendance.checkInTime,
    };
  }

  async checkOut(employeeId: number) {
    const now = new Date();

    const attendanceDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const attendance = await this.attendanceRepository.findOne({
      where: {
        employee: {
          id: employeeId,
        },
        attendanceDate,
      },
      relations: {
        employee: {
          workShift: true,
        },
      },
    });

    if (!attendance) {
      throw new BadRequestException('You have not checked in today');
    }

    if (attendance.checkOutTime) {
      throw new BadRequestException('You have already checked out');
    }

    const shiftEnd = this.timeStringToDate(
      now,
      attendance.employee.workShift.endTime,
    );

    const isEarlyLeave = now < shiftEnd;

    const earlyLeaveMinutes = isEarlyLeave
      ? Math.floor((shiftEnd.getTime() - now.getTime()) / 60000)
      : 0;

    let workedMinutes = Math.floor(
      (now.getTime() - attendance.checkInTime.getTime()) / 60000,
    );

    const { breakStart, breakEnd } = attendance.employee.workShift;

    if (breakStart && breakEnd) {
      const breakStartTime = this.timeStringToDate(now, breakStart);

      const breakEndTime = this.timeStringToDate(now, breakEnd);

      const breakMinutes = Math.floor(
        (breakEndTime.getTime() - breakStartTime.getTime()) / 60000,
      );

      workedMinutes -= breakMinutes;
    }

    attendance.checkOutTime = now;
    attendance.isEarlyLeave = isEarlyLeave;
    attendance.earlyLeaveMinutes = earlyLeaveMinutes;
    attendance.workMinutes = Math.max(workedMinutes, 0);

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Check-out successful',
      checkOutTime: attendance.checkOutTime,
    };
  }
}
