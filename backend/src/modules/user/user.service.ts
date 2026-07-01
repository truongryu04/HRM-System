import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { CreateUserDto } from './dto/create-user.dto';
import { comparePassword, hashPassword } from 'src/common/utils/bcrypt.util';
import { RoleService } from '../role/role.service';
import { GetUsersDto } from './dto/get-user.dto';
import { EmployeeService } from '../employee/employee.service';
import { UserStatus } from './user-status.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly employeeService: EmployeeService,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    const isEmail = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (isEmail) {
      throw new ConflictException('Email đã tồn tại');
    }
    const employee = await this.employeeService.findOne(user.employeeId);
    if (!employee) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }
    const roles = await this.roleService.findByIds(user.roleIds);
    const hashedPassword = await hashPassword(user.password);
    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
      roles,
      employee: employee,
    });
    return await this.userRepository.save(newUser);
  }
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();
    if (!user) {
      return null;
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return null;
    }
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.email = :email', { email })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();
    if (!user) {
      return null;
    }
    return user;
  }
  async findAll(query: GetUsersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      linkedEmployee,
    } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .distinct(true)
      .leftJoinAndSelect('user.employee', 'employee')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.isDeleted = :isDeleted', {
        isDeleted: false,
      });

    // Tìm kiếm theo email hoặc tên nhân viên
    if (search) {
      qb.andWhere(
        `
      (
        LOWER(user.email) LIKE LOWER(:search)
        OR LOWER(employee.fullName) LIKE LOWER(:search)
      )
      `,
        {
          search: `%${search}%`,
        },
      );
    }

    // Lọc theo role
    if (role && role !== 'all') {
      qb.andWhere('role.name = :role', {
        role,
      });
    }

    // Lọc theo trạng thái user
    if (status && status !== 'all') {
      qb.andWhere('user.status = :status', {
        status,
      });
    }

    // Lọc user đã/chưa liên kết employee
    if (linkedEmployee === 'true' || linkedEmployee === 'linked') {
      qb.andWhere('employee.id IS NOT NULL');
    }

    if (linkedEmployee === 'false' || linkedEmployee === 'unlinked') {
      qb.andWhere('employee.id IS NULL');
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async updateStatus(id: number, status: UserStatus) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;

    return await this.userRepository.save(user);
  }

  async assignRoles(userId: number, roleIds: number[]) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isDeleted: false,
      },
      relations: {
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.roleService.findByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more roles do not exist');
    }

    user.roles = roles;

    await this.userRepository.save(user);

    return {
      message: 'Roles assigned successfully',
    };
  }
}
