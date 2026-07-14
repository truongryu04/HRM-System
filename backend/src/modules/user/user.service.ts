import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { In, Repository } from 'typeorm';

import { hashPassword, comparePassword } from 'src/common/utils/bcrypt.util';
import { EmployeeService } from '../employee/employee.service';
import { MailService } from '../mail/mail.service';
import { RoleService } from '../role/role.service';
import { UserTokenType } from '../user-token/user-token.entity';
import { UserTokenService } from '../user-token/user-token.service';
import { BulkPasswordResetDto } from './dto/bulk-password-reset.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserStatus } from './user-status.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly employeeService: EmployeeService,
    private readonly userTokenService: UserTokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const employee = await this.employeeService.findOne(user.employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const roles = await this.roleService.findByIds(user.roleIds);

    if (roles.length !== user.roleIds.length) {
      throw new BadRequestException('One or more roles do not exist');
    }

    const initialPassword = this.getInitialPassword(user.password);
    const hashedPassword = await hashPassword(initialPassword);
    const newUser = this.userRepository.create({
      email: user.email,
      password: hashedPassword,
      status: user.status ?? UserStatus.PENDING,
      roles,
      employee,
    });

    const savedUser = await this.userRepository.save(newUser);
    await this.sendActivationEmail(savedUser);

    return savedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.employee', 'employee')
      .leftJoinAndSelect('role.permissions', 'permission')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      throw new NotFoundException('Password is incorrect');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.employee', 'employee')
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
    if (role && role !== 'all') {
      qb.andWhere('role.name = :role', {
        role,
      });
    }

    if (status && status !== 'all') {
      qb.andWhere('user.status = :status', {
        status,
      });
    }

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

  async findById(id: number): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.employee', 'employee')
      .leftJoinAndSelect('role.permissions', 'permission')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!user) {
      return null;
    }

    return user;
  }

  async updatePassword(id: number, password: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, { password });

    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        roles: true,
        employee: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { roleIds, employeeId, ...data } = updateUserDto;

    Object.assign(user, data);

    if (roleIds !== undefined) {
      const roles = await this.roleService.findByIds(roleIds);

      user.roles = roles;
    }

    if (employeeId !== undefined) {
      const employee = await this.employeeService.findOne(employeeId);

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      user.employee = employee;
    }

    return await this.userRepository.save(user);
  }
  async activateUser(userId: number, password: string) {
    const hashedPassword = await hashPassword(password);

    const result = await this.userRepository.update(
      { id: userId, isDeleted: false },
      {
        password: hashedPassword,
        status: UserStatus.ACTIVE,
      },
    );

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }

  async bulkSendPasswordReset(dto: BulkPasswordResetDto) {
    const users = await this.userRepository.find({
      where: {
        id: In(dto.userIds),
        isDeleted: false,
      },
      relations: {
        employee: true,
      },
    });

    const foundUserIds = new Set(users.map((user) => user.id));
    const missingUserIds = dto.userIds.filter((id) => !foundUserIds.has(id));

    for (const user of users) {
      await this.sendPasswordResetEmail(user);
    }

    return {
      total: dto.userIds.length,
      queued: users.length,
      failed: missingUserIds.length,
      missingUserIds,
    };
  }

  async sendPasswordResetEmail(user: User) {
    const token = await this.userTokenService.createToken({
      user,
      type: UserTokenType.RESET_PASSWORD,
      expiresInMinutes: this.getTokenExpiryMinutes(
        'PASSWORD_RESET_TOKEN_EXPIRES_MINUTES',
        30,
      ),
    });

    await this.mailService.sendPasswordReset({
      to: user.email,
      fullName: user.employee?.fullName,
      resetLink: this.buildFrontendLink('/reset-password', token),
    });
  }
  private async sendActivationEmail(user: User) {
    const token = await this.userTokenService.createToken({
      user,
      type: UserTokenType.ACTIVATE_ACCOUNT,
      expiresInMinutes: this.getTokenExpiryMinutes(
        'ACCOUNT_ACTIVATION_TOKEN_EXPIRES_MINUTES',
        24 * 60,
      ),
    });

    await this.mailService.sendAccountActivation({
      to: user.email,
      fullName: user.employee?.fullName,
      activationLink: this.buildFrontendLink('/activate-account', token),
    });
  }

  private buildFrontendLink(path: string, token: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const baseUrl = frontendUrl.replace(/\/$/, '');

    return `${baseUrl}${path}?token=${encodeURIComponent(token)}`;
  }

  private getTokenExpiryMinutes(configKey: string, fallback: number) {
    const value = Number(this.configService.get<string>(configKey));

    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private getInitialPassword(inputPassword?: string) {
    const defaultPassword = this.configService
      .get<string>('DEFAULT_INITIAL_USER_PASSWORD')
      ?.trim();

    return inputPassword ?? defaultPassword ?? randomBytes(32).toString('hex');
  }
}
