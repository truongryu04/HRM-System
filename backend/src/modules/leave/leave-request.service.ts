import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveType } from './leave-type.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { LeaveRequest } from './leave-request.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { Employee } from '../employee/employee.entity';
import { User } from '../user/user.entity';
import { LeaveStatus } from './leave-status.enum';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { RejectLeaveRequestDto } from './dto/reject-leave-request.dto';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private calculateDays(startDate: Date, endDate: Date): number {
    const diff = endDate.getTime() - startDate.getTime();

    return diff / (1000 * 60 * 60 * 24) + 1;
  }
  async create(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const employee = await this.employeeRepository.findOne({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id: dto.leaveTypeId },
    });

    if (!leaveType) {
      throw new NotFoundException('Loại nghỉ phép không tồn tại');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }

    const leaveRequest = this.leaveRequestRepository.create({
      employee,
      leaveType,
      startDate,
      endDate,
      totalDays: this.calculateDays(startDate, endDate),
      reason: dto.reason,
      attachment: dto.attachment,
    });

    return this.leaveRequestRepository.save(leaveRequest);
  }
  async findAll(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      relations: {
        employee: true,
        leaveType: true,
        approvedBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async findOne(id: number): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: {
        employee: true,
        leaveType: true,
        approvedBy: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy đơn nghỉ phép');
    }

    return request;
  }
  async findByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: {
        employee: {
          id: employeeId,
        },
      },
      relations: {
        leaveType: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async update(id: number, dto: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    const request = await this.findOne(id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Chỉ được sửa đơn đang chờ duyệt');
    }

    Object.assign(request, dto);

    if (dto.startDate && dto.endDate) {
      request.totalDays = this.calculateDays(
        new Date(dto.startDate),
        new Date(dto.endDate),
      );
    }

    return this.leaveRequestRepository.save(request);
  }
  async cancel(id: number): Promise<LeaveRequest> {
    const request = await this.findOne(id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Không thể hủy đơn đã xử lý');
    }

    request.status = LeaveStatus.CANCELLED;

    return this.leaveRequestRepository.save(request);
  }
  async approve(
    id: number,
    userId: number,
    dto: ApproveLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const request = await this.findOne(id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Đơn đã được xử lý');
    }

    const approver = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!approver) {
      throw new NotFoundException('Người duyệt không tồn tại');
    }

    request.status = LeaveStatus.APPROVED;

    request.approvedBy = approver;

    request.approvedAt = new Date();

    request.approvalNote = dto.note;

    return this.leaveRequestRepository.save(request);
  }
  async reject(
    id: number,
    userId: number,
    dto: RejectLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const request = await this.findOne(id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Đơn đã được xử lý');
    }

    const approver = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!approver) {
      throw new NotFoundException('Người duyệt không tồn tại');
    }

    request.status = LeaveStatus.REJECTED;

    request.approvedBy = approver;

    request.approvedAt = new Date();

    request.rejectReason = dto.reason;

    return this.leaveRequestRepository.save(request);
  }
}
