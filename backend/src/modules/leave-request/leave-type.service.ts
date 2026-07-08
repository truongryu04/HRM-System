import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LeaveType } from './entities/leave-type.entity';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Injectable()
export class LeaveTypeService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,
  ) {}

  async create(dto: CreateLeaveTypeDto): Promise<LeaveType> {
    const existed = await this.leaveTypeRepository.findOne({
      where: {
        name: dto.name,
        isDeleted: false,
      },
    });

    if (existed) {
      throw new ConflictException('Loại nghỉ phép đã tồn tại');
    }

    const leaveType = this.leaveTypeRepository.create(dto);

    return this.leaveTypeRepository.save(leaveType);
  }

  async findAll(): Promise<LeaveType[]> {
    return this.leaveTypeRepository.find({
      order: {
        createdAt: 'DESC',
      },
      where: {
        isDeleted: false,
      },
    });
  }

  async findOne(id: number): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!leaveType) {
      throw new NotFoundException('Không tìm thấy loại nghỉ phép');
    }

    return leaveType;
  }

  async update(id: number, dto: UpdateLeaveTypeDto): Promise<LeaveType> {
    const leaveType = await this.findOne(id);

    if (dto.name && dto.name !== leaveType.name) {
      const existed = await this.leaveTypeRepository.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      if (existed) {
        throw new ConflictException('Tên loại nghỉ phép đã tồn tại');
      }
    }

    Object.assign(leaveType, dto);

    return this.leaveTypeRepository.save(leaveType);
  }

  async remove(id: number): Promise<{ message: string }> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!leaveType) {
      throw new NotFoundException('Không tìm thấy loại nghỉ phép');
    }
    leaveType.isDeleted = true;
    await this.leaveTypeRepository.save(leaveType);

    return {
      message: 'Xóa loại nghỉ phép thành công',
    };
  }
}
