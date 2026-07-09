import { DepartmentService } from './../department/department.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Employee, EmployeeStatus } from './employee.entity';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PositionService } from '../position/position.service';
import { WorkShiftsService } from '../work-shifts/work-shifts.service';
import { Department } from '../department/department.entity';
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly DepartmentService: DepartmentService,

    private readonly positionService: PositionService,

    private readonly workShiftService: WorkShiftsService,
  ) {}

  async create(dto: CreateEmployeeDto) {
    const existedEmployee = await this.employeeRepository.findOne({
      where: [
        {
          employeeCode: dto.employeeCode,
        },
        {
          email: dto.email,
        },
      ],
    });

    if (existedEmployee) {
      throw new ConflictException('Employee code or email already exists');
    }

    const department = await this.DepartmentService.findOne(dto.departmentId);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const position = await this.positionService.findOne(dto.positionId);

    if (!position) {
      throw new NotFoundException('Position not found');
    }
    const workShift = dto.workShiftId
      ? await this.workShiftService.findOne(dto.workShiftId)
      : await this.workShiftService.findDefaultWorkShift();

    if (!workShift) {
      throw new NotFoundException(
        dto.workShiftId
          ? 'Work shift not found'
          : 'Default work shift not found',
      );
    }

    const manager = await this.resolveManagerForCreate(
      dto.managerId,
      department,
    );

    const employee = this.employeeRepository.create({
      employeeCode: dto.employeeCode,
      email: dto.email,
      fullName: dto.fullName,
      gender: dto.gender,
      dob: dto.dob,
      phone: dto.phone,
      address: dto.address,
      joinDate: dto.joinDate,
      status: dto.status,
      avatarUrl: dto.avatarUrl,
      department,
      position,
      manager,
    });
    employee.workShift = workShift;
    return this.employeeRepository.save(employee);
  }
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.employeeRepository.findAndCount({
      where: {
        isDeleted: false,
      },
      relations: {
        department: true,
        position: true,
        manager: true,
      },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findOne(id: number) {
    const employee = await this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.position', 'position')
      .leftJoinAndSelect('employee.workShift', 'workShift')
      .leftJoinAndSelect('employee.manager', 'manager')
      .leftJoinAndSelect('employee.users', 'user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('employee.id = :id', { id })
      .andWhere('employee.isDeleted = false')
      .getOne();
    console.log('employee', employee);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
  async update(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    if (dto.departmentId) {
      const department = await this.DepartmentService.findOne(dto.departmentId);

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      employee.department = department;
    }

    if (dto.managerId !== undefined) {
      if (dto.managerId === id) {
        throw new BadRequestException('Employee cannot be their own manager');
      }

      employee.manager = await this.findManagerById(dto.managerId);
    } else if (!employee.manager && employee.department?.manager?.id) {
      employee.manager = await this.findManagerById(
        employee.department.manager.id,
      );
    }

    if (dto.positionId) {
      const position = await this.positionService.findOne(dto.positionId);

      if (!position) {
        throw new NotFoundException('Position not found');
      }

      employee.position = position;
    }

    Object.assign(employee, {
      employeeCode: dto.employeeCode ?? employee.employeeCode,
      email: dto.email ?? employee.email,
      fullName: dto.fullName ?? employee.fullName,
      gender: dto.gender ?? employee.gender,
      dob: dto.dob ?? employee.dob,
      phone: dto.phone ?? employee.phone,
      address: dto.address ?? employee.address,
      joinDate: dto.joinDate ?? employee.joinDate,
      status: dto.status ?? employee.status,
      avatarUrl: dto.avatarUrl ?? employee.avatarUrl,
    });

    return this.employeeRepository.save(employee);
  }
  async remove(id: number) {
    const employee = await this.findOne(id);

    employee.isDeleted = true;

    await this.employeeRepository.save(employee);

    return {
      message: 'Employee deleted successfully',
    };
  }
  async updateStatus(id: number, status: EmployeeStatus) {
    const employee = await this.employeeRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    employee.status = status;
    employee.updatedAt = new Date();

    return this.employeeRepository.save(employee);
  }
  async totalEmployee() {
    const total = await this.employeeRepository.count({
      where: {
        isDeleted: false,
      },
    });
    return total;
  }

  private async resolveManagerForCreate(
    managerId: number | undefined,
    department: Department,
  ) {
    const resolvedManagerId = managerId ?? department.manager?.id;

    if (!resolvedManagerId) {
      throw new BadRequestException(
        'Employee manager is required. Add managerId or configure department manager first',
      );
    }

    return this.findManagerById(resolvedManagerId);
  }

  private async findManagerById(id: number) {
    const manager = await this.employeeRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    return manager;
  }
}
