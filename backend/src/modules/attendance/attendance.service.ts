import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { EmployeeService } from '../employee/employee.service';
import { Between } from 'typeorm/browser/find-options/operator/Between.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { DepartmentAccessService } from '../department/department-access.service';
import type { JwtUser } from '../auth/jwt-user.interface';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly employeeService: EmployeeService,
    private readonly departmentAccessService: DepartmentAccessService,
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
  private recalculateAttendance(attendance: Attendance): Attendance {
    const { workShift } = attendance.employee;
    if (!workShift) {
      return attendance;
    }
    if (attendance.checkInTime) {
      const shiftStart = this.timeStringToDate(
        attendance.checkInTime,
        workShift.lateAfter,
      );

      attendance.isLate = attendance.checkInTime > shiftStart;

      attendance.lateMinutes = attendance.isLate
        ? Math.floor(
            (attendance.checkInTime.getTime() - shiftStart.getTime()) / 60000,
          )
        : 0;
    }

    // ===== Tính về sớm =====

    if (attendance.checkOutTime) {
      const shiftEnd = this.timeStringToDate(
        attendance.checkOutTime,
        workShift.endTime,
      );

      attendance.isEarlyLeave = attendance.checkOutTime < shiftEnd;

      attendance.earlyLeaveMinutes = attendance.isEarlyLeave
        ? Math.floor(
            (shiftEnd.getTime() - attendance.checkOutTime.getTime()) / 60000,
          )
        : 0;
    }

    // ===== Thời gian làm việc và công =====

    if (attendance.checkInTime && attendance.checkOutTime) {
      let workedMinutes = Math.floor(
        (attendance.checkOutTime.getTime() - attendance.checkInTime.getTime()) /
          60000,
      );

      if (workShift.breakStart && workShift.breakEnd) {
        const breakStart = this.timeStringToDate(
          attendance.checkInTime,
          workShift.breakStart,
        );

        const breakEnd = this.timeStringToDate(
          attendance.checkInTime,
          workShift.breakEnd,
        );

        workedMinutes -= this.calculateBreakMinutes(
          attendance.checkInTime,
          attendance.checkOutTime,
          breakStart,
          breakEnd,
        );
      }

      workedMinutes = Math.max(workedMinutes, 0);

      attendance.workMinutes = workedMinutes;

      attendance.workingDayValue = Math.min(
        Number((workedMinutes / workShift.standardMinutes).toFixed(2)),
        1,
      );
    }

    return attendance;
  }
  async checkIn(employeeId: number) {
    const employee = await this.employeeService.findOne(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const now = new Date();

    const attendanceDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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

    attendance.checkOutTime = now;

    this.recalculateAttendance(attendance);

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Check-out successful',
      checkOutTime: attendance.checkOutTime,
      workMinutes: attendance.workMinutes,
      workingDayValue: attendance.workingDayValue,
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
  async getDashboard(user: JwtUser) {
    const now = new Date();

    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(now.getDate()).padStart(2, '0')}`;

    const access = await this.departmentAccessService.resolve(
      user,
      'attendance:read-all',
    );

    if (!access.canAccessAll && !access.departmentId) {
      return {
        totalEmployees: 0,
        present: 0,
        late: 0,
        absent: 0,
        working: 0,
      };
    }

    const managedDepartmentId = access.canAccessAll
      ? undefined
      : access.departmentId!;
    const totalEmployees =
      await this.employeeService.totalEmployee(managedDepartmentId);

    const attendanceQb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.employee', 'employee')
      .leftJoin('employee.department', 'department')
      .where('attendance.attendanceDate = :today', { today })
      .andWhere('employee.isDeleted = false');

    if (managedDepartmentId) {
      attendanceQb.andWhere('department.id = :managedDepartmentId', {
        managedDepartmentId,
      });
    }

    const present = await attendanceQb.clone().getCount();

    const late = await attendanceQb
      .clone()
      .andWhere('attendance.isLate = true')
      .getCount();

    const absent = Math.max(totalEmployees - present, 0);

    const working = await attendanceQb
      .clone()
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
  async findAll(query: AttendanceQueryDto, user: JwtUser) {
    const {
      page = '1',
      limit = '10',
      search,
      departmentId,
      employeeId,
      date,
      positionId,
    } = query;

    const qb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.position', 'position');

    const access = await this.departmentAccessService.resolve(
      user,
      'attendance:read-all',
    );

    if (!access.canAccessAll && !access.departmentId) {
      return {
        data: [],
        meta: {
          page: +page,
          limit: +limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    if (!access.canAccessAll) {
      qb.andWhere('department.id = :managedDepartmentId', {
        managedDepartmentId: access.departmentId,
      });
    }

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

    if (date) {
      qb.andWhere('attendance.attendanceDate = :date', { date });
    }
    if (positionId) {
      qb.andWhere('position.id = :positionId', {
        positionId,
      });
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
  async update(id: number, dto: UpdateAttendanceDto, user: JwtUser) {
    const access = await this.departmentAccessService.resolve(
      user,
      'attendance:read-all',
    );

    if (!access.canAccessAll && !access.departmentId) {
      throw new ForbiddenException(
        'You do not have permission to update this attendance',
      );
    }

    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: {
        employee: {
          workShift: true,
          department: true,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (
      !access.canAccessAll &&
      attendance.employee.department.id !== access.departmentId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this attendance',
      );
    }

    if (dto.checkInTime !== undefined) {
      attendance.checkInTime = dto.checkInTime
        ? new Date(dto.checkInTime)
        : null;
    }

    if (dto.checkOutTime !== undefined) {
      attendance.checkOutTime = dto.checkOutTime
        ? new Date(dto.checkOutTime)
        : null;
    }

    if (dto.note !== undefined) {
      attendance.note = dto.note;
    }

    this.recalculateAttendance(attendance);

    return this.attendanceRepository.save(attendance);
  }
}
