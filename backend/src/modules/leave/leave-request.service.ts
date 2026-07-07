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
}
