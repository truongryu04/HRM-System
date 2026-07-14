import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkShift } from './work-shifts.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { UpdateWorkShiftDto } from './dto/update-work-shift.dto';

@Injectable()
export class WorkShiftsService {
  constructor(
    @InjectRepository(WorkShift)
    private readonly workShiftRepository: Repository<WorkShift>,
  ) {}

  private async clearDefaultWorkShift() {
    await this.workShiftRepository
      .createQueryBuilder()
      .update(WorkShift)
      .set({ isDefault: false })
      .where({ isDefault: true })
      .execute();
  }

  async create(createWorkShiftDto: CreateWorkShiftDto) {
    const existed = await this.workShiftRepository.findOne({
      where: {
        name: createWorkShiftDto.name,
      },
    });

    if (existed) {
      throw new BadRequestException('Tên ca làm việc đã tồn tại');
    }

    if (createWorkShiftDto.isDefault) {
      await this.clearDefaultWorkShift();
    }

    const workShift = this.workShiftRepository.create({
      ...createWorkShiftDto,
    });

    return await this.workShiftRepository.save(workShift);
  }
  async findOne(id: number) {
    const workShift = await this.workShiftRepository.findOne({ where: { id } });
    if (!workShift) {
      throw new NotFoundException(`Ca làm việc ${id} không tồn tại`);
    }
    return workShift;
  }
  async findAll() {
    return this.workShiftRepository.find({
      order: { isDefault: 'DESC', id: 'ASC' },
    });
  }
  async update(id: number, dto: UpdateWorkShiftDto) {
    const workShift = await this.findOne(id);

    if (dto.name) {
      const duplicate = await this.workShiftRepository.findOne({
        where: { name: dto.name, id: Not(id) },
      });
      if (duplicate) throw new ConflictException('Tên ca làm việc đã tồn tại');
    }

    if (dto.isDefault) {
      await this.clearDefaultWorkShift();
    }

    Object.assign(workShift, dto);
    return this.workShiftRepository.save(workShift);
  }
  async remove(id: number) {
    const workShift = await this.findOne(id);
    if (workShift.isDefault) {
      throw new BadRequestException('Không thể xóa ca làm việc mặc định');
    }

    try {
      await this.workShiftRepository.remove(workShift);
      return { message: 'Xóa ca làm việc thành công' };
    } catch {
      throw new ConflictException(
        'Không thể xóa ca làm việc đang được gán cho nhân viên',
      );
    }
  }
  async findDefaultWorkShift() {
    return await this.workShiftRepository.findOne({
      where: { isDefault: true },
    });
  }
}
