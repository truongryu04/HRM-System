import { DepartmentService } from './../department/department.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Repository } from 'typeorm';

import { Employee, EmployeeStatus } from './employee.entity';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PositionService } from '../position/position.service';
import { WorkShiftsService } from '../work-shifts/work-shifts.service';
import { Department } from '../department/department.entity';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DepartmentAccessService } from '../department/department-access.service';
import type { JwtUser } from '../auth/jwt-user.interface';
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly DepartmentService: DepartmentService,

    private readonly positionService: PositionService,

    private readonly workShiftService: WorkShiftsService,
    private readonly departmentAccessService: DepartmentAccessService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateEmployeeDto, avatar?: Express.Multer.File) {
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

    const uploadedAvatar = avatar
      ? await this.uploadAvatar(avatar, dto.employeeCode)
      : undefined;
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
      avatarUrl: uploadedAvatar?.secure_url ?? dto.avatarUrl,
      avatarPublicId: uploadedAvatar?.public_id,
      department,
      position,
      manager,
    });
    employee.workShift = workShift;
    try {
      return await this.employeeRepository.save(employee);
    } catch (error) {
      if (uploadedAvatar) {
        await this.safeDeleteAvatar(uploadedAvatar.public_id);
      }
      throw error;
    }
  }
  async findAll(user: JwtUser, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const access = await this.departmentAccessService.resolve(
      user,
      'employee:read-all',
    );

    if (!access.canAccessAll && !access.departmentId) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const where: FindOptionsWhere<Employee> = {
      isDeleted: false,
      ...(!access.canAccessAll
        ? { department: { id: access.departmentId! } }
        : {}),
    };

    const [data, total] = await this.employeeRepository.findAndCount({
      where,
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
  async findOneAccessible(id: number, user: JwtUser) {
    const access = await this.departmentAccessService.resolve(
      user,
      'employee:read-all',
    );

    if (!access.canAccessAll && !access.departmentId) {
      throw new ForbiddenException(
        'You do not have permission to access this employee',
      );
    }

    const employee = await this.findOne(id);

    if (
      !access.canAccessAll &&
      employee.department.id !== access.departmentId
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this employee',
      );
    }

    return employee;
  }
  async findMyProfile(employeeId: number | undefined) {
    if (!employeeId) {
      throw new BadRequestException(
        'Tài khoản chưa được liên kết với nhân viên',
      );
    }
    return this.findOne(employeeId);
  }
  async update(
    id: number,
    dto: UpdateEmployeeDto,
    avatar?: Express.Multer.File,
  ) {
    const employee = await this.findOne(id);
    const previousAvatarPublicId = employee.avatarPublicId;
    const uploadedAvatar = avatar
      ? await this.uploadAvatar(avatar, employee.employeeCode)
      : undefined;

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
      avatarUrl:
        uploadedAvatar?.secure_url ??
        (dto.removeAvatar ? null : (dto.avatarUrl ?? employee.avatarUrl)),
      avatarPublicId:
        uploadedAvatar?.public_id ??
        (dto.removeAvatar ? null : employee.avatarPublicId),
    });

    try {
      const savedEmployee = await this.employeeRepository.save(employee);
      if ((uploadedAvatar || dto.removeAvatar) && previousAvatarPublicId) {
        await this.safeDeleteAvatar(previousAvatarPublicId);
      }
      return savedEmployee;
    } catch (error) {
      if (uploadedAvatar) {
        await this.safeDeleteAvatar(uploadedAvatar.public_id);
      }
      throw error;
    }
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
  async totalEmployee(departmentId?: number) {
    const total = await this.employeeRepository.count({
      where: {
        isDeleted: false,
        ...(departmentId ? { department: { id: departmentId } } : {}),
      },
    });
    return total;
  }
  async updateMyProfile(
    id: number | undefined,
    dto: UpdateMyProfileDto,
    avatar?: Express.Multer.File,
  ) {
    const employee = await this.findMyProfile(id);
    const previousAvatarPublicId = employee.avatarPublicId;
    const uploadedAvatar = avatar
      ? await this.uploadAvatar(avatar, employee.employeeCode)
      : undefined;

    const { removeAvatar, ...profileData } = dto;
    Object.assign(employee, profileData, {
      avatarUrl:
        uploadedAvatar?.secure_url ??
        (removeAvatar ? null : employee.avatarUrl),
      avatarPublicId:
        uploadedAvatar?.public_id ??
        (removeAvatar ? null : employee.avatarPublicId),
    });
    try {
      const savedEmployee = await this.employeeRepository.save(employee);
      if ((uploadedAvatar || removeAvatar) && previousAvatarPublicId) {
        await this.safeDeleteAvatar(previousAvatarPublicId);
      }
      return savedEmployee;
    } catch (error) {
      if (uploadedAvatar) {
        await this.safeDeleteAvatar(uploadedAvatar.public_id);
      }
      throw error;
    }
  }

  private uploadAvatar(file: Express.Multer.File, employeeCode: string) {
    return this.cloudinaryService.uploadFile(file, {
      folder: 'hrm/employees/avatars',
      filename_override: employeeCode.toLowerCase(),
      use_filename: true,
      unique_filename: true,
      resource_type: 'image',
    });
  }

  private async safeDeleteAvatar(publicId: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteFile(publicId);
    } catch {}
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
