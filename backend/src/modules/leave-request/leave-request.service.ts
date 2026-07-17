import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { Request } from '../request/entities/request.entity';
import {
  RequestApprovedHandler,
  RequestApprovedHandlerRegistry,
} from '../request/request-approved-handler.registry';
import { RequestService } from '../request/request.service';
import { RequestStatus } from '../request/enums/request-status.enum';
import { RequestTypeCode } from '../request/enums/request-type-code.enum';
import { User } from '../user/user.entity';
import type { JwtUser } from '../auth/jwt-user.interface';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveSession } from './enums/leave-session.enum';
import { LeaveRequestDay } from './entities/leave-request-day.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveType } from './entities/leave-type.entity';

@Injectable()
export class LeaveRequestService
  implements OnModuleInit, RequestApprovedHandler
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly requestService: RequestService,
    private readonly approvedHandlerRegistry: RequestApprovedHandlerRegistry,

    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,

    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,
  ) {}

  onModuleInit(): void {
    this.approvedHandlerRegistry.register('leave-request', this);
    this.approvedHandlerRegistry.register(RequestTypeCode.LEAVE_REQUEST, this);
  }

  async create(dto: CreateLeaveRequestDto, user?: JwtUser): Promise<unknown> {
    const startDate = this.parseDate(dto.startDate);
    const endDate = this.parseDate(dto.endDate);
    const session = dto.session ?? LeaveSession.FULL;
    this.assertValidDateRange(startDate, endDate);
    this.assertValidSessionRange(startDate, endDate, session);

    const employeeId = dto.employeeId ?? user?.employeeId;
    if (!employeeId) {
      throw new BadRequestException('Thieu nhan vien tao don nghi phep');
    }

    return this.dataSource.transaction(async (manager) => {
      const employee = await manager.findOne(Employee, {
        where: { id: employeeId },
      });
      if (!employee) {
        throw new NotFoundException('Nhan vien khong ton tai');
      }

      const leaveType = await manager.findOne(LeaveType, {
        where: { id: dto.leaveTypeId, isDeleted: false },
      });
      if (!leaveType) {
        throw new NotFoundException('Loai nghi phep khong ton tai');
      }

      await this.assertNoOverlappingLeave(
        employee.id,
        dto.startDate,
        dto.endDate,
      );

      const createdBy = await manager.findOne(User, {
        where: { id: user?.id },
      });
      if (!createdBy) {
        throw new NotFoundException('Nguoi tao yeu cau khong ton tai');
      }

      const request = await this.requestService.createBusinessRequest(
        {
          requestTypeCode: RequestTypeCode.LEAVE_REQUEST,
          employee,
          createdBy,
          title: `Xin nghỉ phép ${dto.startDate} đến ${dto.endDate}`,
        },
        manager,
      );

      const leaveRequest = manager.create(LeaveRequest, {
        request,
        leaveType,
        startDate,
        endDate,
        session,
        totalDays: this.calculateDays(startDate, endDate, session),
        reason: dto.reason,
        attachment: dto.attachment,
      });

      const saved = await manager.save(LeaveRequest, leaveRequest);
      return this.toResponse(saved);
    });
  }

  async findAll(): Promise<unknown[]> {
    const requests = await this.leaveRequestRepository.find({
      relations: {
        request: {
          employee: true,
          createdBy: true,
          finalApprovedBy: true,
          rejectedBy: true,
        },
        leaveType: true,
      },
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => this.toResponse(request));
  }

  async findOne(id: number): Promise<unknown> {
    const request = await this.findEntity(id);
    return this.toResponse(request);
  }

  async findByEmployee(employeeId: number): Promise<unknown[]> {
    const requests = await this.leaveRequestRepository.find({
      where: { request: { employee: { id: employeeId } } },
      relations: {
        request: {
          employee: true,
          createdBy: true,
          finalApprovedBy: true,
          rejectedBy: true,
        },
        leaveType: true,
      },
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => this.toResponse(request));
  }

  async findByRequestId(requestId: number): Promise<unknown> {
    const request = await this.leaveRequestRepository.findOne({
      where: { request: { id: requestId } },
      relations: {
        request: {
          employee: true,
          createdBy: true,
          finalApprovedBy: true,
          rejectedBy: true,
        },
        leaveType: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Khong tim thay don nghi phep');
    }

    return this.toResponse(request);
  }

  findMy(user: JwtUser): Promise<unknown[]> {
    return this.findByEmployee(user.employeeId);
  }

  async handle(request: Request, manager: EntityManager): Promise<void> {
    const leaveRequest = await manager.findOne(LeaveRequest, {
      where: { request: { id: request.id } },
      relations: { request: { employee: true }, leaveType: true },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Khong tim thay don nghi phep');
    }

    const existingDays = await manager.count(LeaveRequestDay, {
      where: { leaveRequest: { id: leaveRequest.id } },
    });
    if (existingDays > 0) {
      return;
    }

    const days = this.buildLeaveDays(leaveRequest, manager);
    await manager.save(LeaveRequestDay, days);
  }

  async update(
    id: number,
    dto: UpdateLeaveRequestDto,
    user: JwtUser,
  ): Promise<unknown> {
    const request = await this.findEntity(id);

    if (request.request.employee.id !== user.employeeId) {
      throw new ForbiddenException('Ban chi duoc sua don nghi phep cua minh');
    }

    if (request.request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Chi duoc sua don dang cho duyet');
    }

    const startDate = dto.startDate
      ? this.parseDate(dto.startDate)
      : request.startDate;
    const endDate = dto.endDate ? this.parseDate(dto.endDate) : request.endDate;
    const session = dto.session ?? request.session;
    this.assertValidDateRange(startDate, endDate);
    this.assertValidSessionRange(startDate, endDate, session);

    if (dto.leaveTypeId) {
      const leaveType = await this.leaveTypeRepository.findOne({
        where: { id: dto.leaveTypeId, isDeleted: false },
      });
      if (!leaveType) {
        throw new NotFoundException('Loai nghi phep khong ton tai');
      }
      request.leaveType = leaveType;
    }

    if (dto.startDate || dto.endDate || dto.session) {
      await this.assertNoOverlappingLeave(
        request.request.employee.id,
        this.toDateOnly(startDate),
        this.toDateOnly(endDate),
        request.id,
      );
      request.startDate = startDate;
      request.endDate = endDate;
      request.session = session;
      request.totalDays = this.calculateDays(startDate, endDate, session);
      request.request.title = `Xin nghi phep ${this.toDateOnly(startDate)} - ${this.toDateOnly(endDate)}`;
    }

    if (dto.reason !== undefined) {
      request.reason = dto.reason;
    }
    if (dto.attachment !== undefined) {
      request.attachment = dto.attachment;
    }

    await this.dataSource.manager.save(request.request);
    const saved = await this.leaveRequestRepository.save(request);

    return this.toResponse(saved);
  }

  private async findEntity(id: number): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: {
        request: {
          employee: true,
          createdBy: true,
          finalApprovedBy: true,
          rejectedBy: true,
        },
        leaveType: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Khong tim thay don nghi phep');
    }

    return request;
  }

  private async assertNoOverlappingLeave(
    employeeId: number,
    startDate: string,
    endDate: string,
    ignoredLeaveRequestId?: number,
  ): Promise<void> {
    const qb = this.leaveRequestRepository
      .createQueryBuilder('leaveRequest')
      .innerJoin('leaveRequest.request', 'request')
      .where('request.employee_id = :employeeId', { employeeId })
      .andWhere('leaveRequest.startDate <= :endDate', { endDate })
      .andWhere('leaveRequest.endDate >= :startDate', { startDate })
      .andWhere('request.status IN (:...statuses)', {
        statuses: [
          RequestStatus.PENDING,
          RequestStatus.CONFIRMED,
          RequestStatus.APPROVED,
        ],
      });

    if (ignoredLeaveRequestId) {
      qb.andWhere('leaveRequest.id != :ignoredLeaveRequestId', {
        ignoredLeaveRequestId,
      });
    }

    const overlap = await qb.getExists();
    if (overlap) {
      throw new BadRequestException('Don nghi phep bi trung thoi gian');
    }
  }

  private calculateDays(
    startDate: Date,
    endDate: Date,
    session: LeaveSession,
  ): number {
    const start = Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    );
    const end = Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
    );

    const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

    return session === LeaveSession.FULL ? totalDays : 0.5;
  }

  private parseDate(value: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    return new Date(`${value}T00:00:00.000Z`);
  }

  private assertValidDateRange(startDate: Date, endDate: Date): void {
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Ngay nghi phep khong hop le');
    }

    if (startDate > endDate) {
      throw new BadRequestException(
        'Ngay bat dau phai nho hon hoac bang ngay ket thuc',
      );
    }
  }

  private assertValidSessionRange(
    startDate: Date,
    endDate: Date,
    session: LeaveSession,
  ): void {
    if (
      session !== LeaveSession.FULL &&
      this.toDateOnly(startDate) !== this.toDateOnly(endDate)
    ) {
      throw new BadRequestException(
        'Nghi nua ngay chi ap dung khi ngay bat dau va ket thuc giong nhau',
      );
    }
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private buildLeaveDays(
    leaveRequest: LeaveRequest,
    manager: EntityManager,
  ): LeaveRequestDay[] {
    const days: LeaveRequestDay[] = [];
    const current = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);

    while (current <= end) {
      days.push(
        manager.create(LeaveRequestDay, {
          leaveRequest,
          employee: leaveRequest.request.employee,
          date: current.toISOString().slice(0, 10),
          value: leaveRequest.session === LeaveSession.FULL ? 1 : 0.5,
          session: leaveRequest.session,
          isPaid: leaveRequest.leaveType.isPaid,
          deductFromBalance: true,
        }),
      );
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  private toResponse(leaveRequest: LeaveRequest) {
    const request = leaveRequest.request;

    return {
      id: leaveRequest.id,
      requestId: request.id,
      requestCode: request.code,
      request,
      employee: request.employee,
      leaveType: leaveRequest.leaveType,
      startDate: this.toDateOnly(this.parseDate(leaveRequest.startDate)),
      endDate: this.toDateOnly(this.parseDate(leaveRequest.endDate)),
      session: leaveRequest.session,
      totalDays: leaveRequest.totalDays,
      reason: leaveRequest.reason,
      attachment: leaveRequest.attachment,
      status: request.status,
      approvedBy: request.finalApprovedBy,
      approvedAt: request.finalApprovedAt,
      rejectReason: request.rejectionReason,
      approvalNote: request.note,
      createdAt: leaveRequest.createdAt,
      updatedAt: leaveRequest.updatedAt,
    };
  }
}
