import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { JwtUser } from '../auth/jwt-user.interface';
import { ForbiddenException, Injectable } from '@nestjs/common';

export interface DepartmentAccess {
  canAccessAll: boolean;
  departmentId: number | null;
}

@Injectable()
export class DepartmentAccessService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async resolve(
    user: JwtUser,
    readAllPermission: string,
  ): Promise<DepartmentAccess> {
    if (user.permissions.includes(readAllPermission)) {
      return {
        canAccessAll: true,
        departmentId: null,
      };
    }

    if (!user.employeeId) {
      throw new ForbiddenException('Tài khoản chưa liên kết với nhân viên');
    }

    const department = await this.departmentRepository.findOne({
      where: {
        manager: { id: user.employeeId },
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    return {
      canAccessAll: false,
      departmentId: department?.id ?? null,
    };
  }
}
