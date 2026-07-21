import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveTypeCode } from './enums/leave-type-code.enum';

@Injectable()
export class LeaveTypeService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,
  ) {}

  async create(dto: CreateLeaveTypeDto): Promise<LeaveType> {
    this.validateHalfDayIncrement(dto.annualQuota, 'Quota năm');

    const normalizedName = dto.name.trim();
    const existed = await this.leaveTypeRepository
      .createQueryBuilder('leaveType')
      .where('leaveType.code = :code', { code: dto.code })
      .orWhere('LOWER(leaveType.name) = LOWER(:name)', {
        name: normalizedName,
      })
      .getOne();

    if (existed) {
      throw new ConflictException('Loại nghỉ phép đã tồn tại');
    }

    const leaveType = this.leaveTypeRepository.create({
      code: dto.code,
      name: normalizedName,
      description: dto.description?.trim(),
      ...this.resolveBusinessConfig(dto.code, dto.annualQuota),
    });

    return this.leaveTypeRepository.save(leaveType);
  }

  async findAll(): Promise<LeaveType[]> {
    return this.leaveTypeRepository.find({
      order: { createdAt: 'DESC' },
      where: { isDeleted: false },
    });
  }

  async findOne(id: number): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!leaveType) {
      throw new NotFoundException('Không tìm thấy loại nghỉ phép');
    }

    return leaveType;
  }

  async update(id: number, dto: UpdateLeaveTypeDto): Promise<LeaveType> {
    this.validateHalfDayIncrement(dto.annualQuota, 'Quota năm');

    const leaveType = await this.findOne(id);

    if (dto.code !== undefined) {
      if (leaveType.code !== null && leaveType.code !== dto.code) {
        throw new BadRequestException(
          'Không được thay đổi mã của loại nghỉ phép đã cấu hình',
        );
      }

      const sameCode = await this.leaveTypeRepository.findOne({
        where: { id: Not(id), code: dto.code },
      });
      if (sameCode) {
        throw new ConflictException('Mã loại nghỉ phép đã tồn tại');
      }

      const quota =
        dto.annualQuota ??
        (leaveType.code === dto.code
          ? Number(leaveType.annualQuota)
          : undefined);
      leaveType.code = dto.code;
      Object.assign(leaveType, this.resolveBusinessConfig(dto.code, quota));
    }

    if (dto.name && dto.name.trim() !== leaveType.name) {
      const existed = await this.leaveTypeRepository.findOne({
        where: {
          id: Not(id),
          name: dto.name.trim(),
        },
      });

      if (existed) {
        throw new ConflictException('Tên loại nghỉ phép đã tồn tại');
      }

      leaveType.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      leaveType.description = dto.description.trim();
    }
    if (dto.isActive !== undefined) {
      leaveType.isActive = dto.isActive;
    }
    if (dto.annualQuota !== undefined && dto.code === undefined) {
      if (leaveType.code !== LeaveTypeCode.ANNUAL_LEAVE) {
        throw new BadRequestException(
          'Chỉ nghỉ phép năm mới được cấu hình quota',
        );
      }
      leaveType.annualQuota = dto.annualQuota;
    }

    return this.leaveTypeRepository.save(leaveType);
  }

  async remove(id: number): Promise<{ message: string }> {
    const leaveType = await this.findOne(id);
    leaveType.isActive = false;
    await this.leaveTypeRepository.save(leaveType);

    return {
      message: 'Ngừng sử dụng loại nghỉ phép thành công',
    };
  }

  private resolveBusinessConfig(
    code: LeaveTypeCode,
    annualQuota?: number,
  ): Pick<LeaveType, 'isPaid' | 'deductFromBalance' | 'annualQuota'> {
    if (code === LeaveTypeCode.UNPAID_LEAVE) {
      if (annualQuota !== undefined && annualQuota !== 0) {
        throw new BadRequestException(
          'Nghỉ không lương không được cấu hình quota',
        );
      }

      return {
        isPaid: false,
        deductFromBalance: false,
        annualQuota: 0,
      };
    }

    return {
      isPaid: true,
      deductFromBalance: true,
      annualQuota: annualQuota ?? 12,
    };
  }

  private validateHalfDayIncrement(
    value: number | undefined,
    fieldName: string,
  ): void {
    if (
      value !== undefined &&
      (!Number.isFinite(value) || !Number.isInteger(value * 2))
    ) {
      throw new BadRequestException(
        `${fieldName} phải tăng theo bước 0,5 ngày`,
      );
    }
  }
}
