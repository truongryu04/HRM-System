import {
  ConflictException,
  Inject,
  forwardRef,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
  ) {}
  async create(createDepartmentDto: CreateDepartmentDto) {
    const existed = await this.departmentRepository.findOne({
      where: [
        {
          code: createDepartmentDto.code,
          isDeleted: false,
        },
        {
          name: createDepartmentDto.name,
          isDeleted: false,
        },
      ],
    });

    if (existed) {
      throw new ConflictException('Department already exists');
    }

    const manager = createDepartmentDto.managerId
      ? await this.employeeService.findOne(createDepartmentDto.managerId)
      : undefined;

    if (createDepartmentDto.managerId && !manager) {
      throw new NotFoundException('Manager not found');
    }

    const department = this.departmentRepository.create({
      code: createDepartmentDto.code,
      name: createDepartmentDto.name,
      description: createDepartmentDto.description,
      status: createDepartmentDto.status ?? 'ACTIVE',
      manager,
    });

    return await this.departmentRepository.save(department);
  }
  async findAll() {
    return await this.departmentRepository.find({
      where: {
        isDeleted: false,
      },
      relations: {
        manager: true,
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
      relations: {
        manager: true,
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
      updateDepartmentDto.code &&
      updateDepartmentDto.code !== department.code
    ) {
      const existed = await this.departmentRepository.findOne({
        where: {
          code: updateDepartmentDto.code,
          isDeleted: false,
        },
      });

      if (existed) {
        throw new ConflictException('Department code already exists');
      }
    }

    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existed = await this.departmentRepository.findOne({
        where: {
          name: updateDepartmentDto.name,
          isDeleted: false,
        },
      });

      if (existed) {
        throw new ConflictException('Department name already exists');
      }
    }

    let manager = department.manager;

    if (updateDepartmentDto.managerId !== undefined) {
      manager = updateDepartmentDto.managerId
        ? await this.employeeService.findOne(updateDepartmentDto.managerId)
        : undefined;
    }

    const updatedDepartment = {
      ...department,
      code: updateDepartmentDto.code ?? department.code,
      name: updateDepartmentDto.name ?? department.name,
      description: updateDepartmentDto.description ?? department.description,
      status: updateDepartmentDto.status ?? department.status,
      manager,
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
