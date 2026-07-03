import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { EmployeeService } from '../employee/employee.service';
import { Between } from 'typeorm/browser/find-options/operator/Between.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

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
  private calculateBreakMinutes(
    checkIn: Date,
    checkOut: Date,
    breakStart: Date,
    breakEnd: Date,
  ): number {
    const overlapStart = Math.max(checkIn.getTime(), breakStart.getTime());

    const overlapEnd = Math.min(checkOut.getTime(), breakEnd.getTime());

    if (overlapEnd <= overlapStart) {
      return 0;
    }

    return Math.floor((overlapEnd - overlapStart) / 60000);
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
    if (!attendance.checkInTime) {
      throw new BadRequestException('Bạn chưa checkin');
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

      workedMinutes -= this.calculateBreakMinutes(
        attendance.checkInTime,
        now,
        breakStartTime,
        breakEndTime,
      );
    }
    const ratio = workedMinutes / attendance.employee.workShift.standardMinutes;

    const workingDayValue = Math.min(Math.round(ratio * 10) / 10, 1);

    attendance.checkOutTime = now;
    attendance.isEarlyLeave = isEarlyLeave;
    attendance.earlyLeaveMinutes = earlyLeaveMinutes;
    attendance.workMinutes = Math.max(workedMinutes, 0);
    attendance.workingDayValue = workingDayValue;
    await this.attendanceRepository.save(attendance);

    return {
      message: 'Check-out successful',
      checkOutTime: attendance.checkOutTime,
    };
  }

  async getCalendar(employeeId: number, month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    const lastDay = new Date(year, month, 0).getDate();

    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(
      lastDay,
    ).padStart(2, '0')}`;

    const attendances = await this.attendanceRepository.find({
      where: {
        employee: {
          id: employeeId,
        },
        attendanceDate: Between(startDate, endDate),
      },
      order: {
        attendanceDate: 'ASC',
      },
    });
    const calendar: Record<string, any> = {};

    attendances.forEach((attendance) => {
      calendar[attendance.attendanceDate] = {
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        workingDayValue: Number(attendance.workingDayValue),
        lateMinutes: attendance.lateMinutes,
        isLate: attendance.isLate,
        earlyLeaveMinutes: attendance.earlyLeaveMinutes,
        isEarlyLeave: attendance.isEarlyLeave,
      };
    });
    return {
      month,
      year,
      calendar,
    };
  }

  async getToday(employeeId: number) {
    const today = new Date();

    const attendanceDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const attendance = await this.attendanceRepository.findOne({
      where: {
        employee: {
          id: employeeId,
        },
        attendanceDate,
      },
    });
    return attendance;
  }
  async getDashboard() {
    const today = new Date().toISOString().split('T')[0];

    const totalEmployees = await this.employeeService.totalEmployee();

    const present = await this.attendanceRepository.count({
      where: {
        attendanceDate: today,
      },
    });

    const late = await this.attendanceRepository.count({
      where: {
        attendanceDate: today,
        isLate: true,
      },
    });

    const absent = totalEmployees - present - late;

    const working = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.attendanceDate = :today', { today })
      .andWhere('attendance.checkInTime IS NOT NULL')
      .andWhere('attendance.checkOutTime IS NULL')
      .getCount();

    return {
      totalEmployees,
      present,
      late,
      absent,
      working,
    };
  }
  async findAll(query: AttendanceQueryDto) {
    const {
      page = '1',
      limit = '10',
      search,
      departmentId,
      employeeId,
      fromDate,
      toDate,
    } = query;

    const qb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.position', 'position');

    if (search) {
      qb.andWhere(
        '(employee.fullName ILIKE :search OR employee.employeeCode ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (departmentId) {
      qb.andWhere('department.id = :departmentId', {
        departmentId,
      });
    }

    if (employeeId) {
      qb.andWhere('employee.id = :employeeId', {
        employeeId,
      });
    }

    if (fromDate) {
      qb.andWhere('attendance.attendanceDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('attendance.attendanceDate <= :toDate', { toDate });
    }

    qb.orderBy('attendance.attendanceDate', 'DESC');

    const [data, total] = await qb
      .skip((+page - 1) * +limit)
      .take(+limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page: +page,
        limit: +limit,
        total,
        totalPages: Math.ceil(total / +limit),
      },
    };
  }
}
