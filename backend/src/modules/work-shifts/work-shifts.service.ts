import { BadRequestException, Injectable } from '@nestjs/common';
import { WorkShift } from './work-shifts.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';

@Injectable()
export class WorkShiftsService {
  constructor(
    @InjectRepository(WorkShift)
    private readonly workShiftRepository: Repository<WorkShift>,
  ) {}

  async create(createWorkShiftDto: CreateWorkShiftDto) {
    const existed = await this.workShiftRepository.findOne({
      where: {
        name: createWorkShiftDto.name,
      },
    });

    if (existed) {
      throw new BadRequestException('Tên ca làm việc đã tồn tại');
    }

    const workShift = this.workShiftRepository.create({
      ...createWorkShiftDto,
    });

    return await this.workShiftRepository.save(workShift);
  }
  async findOne(id: number) {
    return await this.workShiftRepository.findOne({ where: { id } });
  }
  async findDefaultWorkShift() {
    return await this.workShiftRepository.findOne({
      where: { isDefault: true },
    });
  }
}
