import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Position } from './position.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  async create(createPositionDto: CreatePositionDto) {
    const existed = await this.positionRepository.findOne({
      where: [
        { code: createPositionDto.code },
        { name: createPositionDto.name },
      ],
    });

    if (existed) {
      throw new ConflictException('Position code hoặc name đã tồn tại');
    }

    const position = this.positionRepository.create({
      code: createPositionDto.code,
      name: createPositionDto.name,
      description: createPositionDto.description,
      level: createPositionDto.level,
      status: createPositionDto.status ?? 'ACTIVE',
    });

    return await this.positionRepository.save(position);
  }
  async findAll() {
    return await this.positionRepository.find({
      where: {
        is_active: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }
  async findOne(id: number) {
    const position = await this.positionRepository.findOne({
      where: {
        id,
        is_active: true,
      },
    });

    if (!position) {
      throw new NotFoundException(`Position ${id} không tồn tại`);
    }

    return position;
  }
  async update(id: number, updatePositionDto: UpdatePositionDto) {
    const position = await this.findOne(id);

    if (updatePositionDto.code) {
      const existedCode = await this.positionRepository.findOne({
        where: {
          code: updatePositionDto.code,
        },
      });

      if (existedCode && existedCode.id !== id) {
        throw new ConflictException('Position code đã tồn tại');
      }
    }

    if (updatePositionDto.name) {
      const existedName = await this.positionRepository.findOne({
        where: {
          name: updatePositionDto.name,
        },
      });

      if (existedName && existedName.id !== id) {
        throw new ConflictException('Position name đã tồn tại');
      }
    }

    position.code = updatePositionDto.code ?? position.code;

    position.name = updatePositionDto.name ?? position.name;

    position.description =
      updatePositionDto.description ?? position.description;

    position.level = updatePositionDto.level ?? position.level;

    position.status = updatePositionDto.status ?? position.status;

    return await this.positionRepository.save(position);
  }
  async remove(id: number) {
    const position = await this.findOne(id);

    position.is_active = false;

    await this.positionRepository.save(position);

    return {
      message: 'Position deleted successfully',
    };
  }
}
