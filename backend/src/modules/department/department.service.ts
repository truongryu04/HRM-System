import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { Department } from './department.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}
  async create(createDepartmentDto: CreateDepartmentDto) {
    const existed = await this.departmentRepository.findOne({
      where: {
        name: createDepartmentDto.name,
        isDeleted: false,
      },
    });

    if (existed) {
      throw new ConflictException('Department already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);

    return await this.departmentRepository.save(department);
  }
  async findAll() {
    return await this.departmentRepository.find({
      where: {
        isDeleted: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }
  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);

    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existed = await this.departmentRepository.findOne({
        where: {
          name: updateDepartmentDto.name as string,
          isDeleted: false,
        },
      });

      if (existed) {
        throw new ConflictException('Department name already exists');
      }
    }
    const updatedDepartment = {
      ...department,
      ...updateDepartmentDto,
    };

    return await this.departmentRepository.save(updatedDepartment);
  }
  async remove(id: number) {
    const department = await this.findOne(id);

    department.isDeleted = true;

    await this.departmentRepository.save(department);

    return {
      message: 'Department deleted successfully',
    };
  }
}
