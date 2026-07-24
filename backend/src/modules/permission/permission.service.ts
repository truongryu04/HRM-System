import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { Permission } from './permission.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { In } from 'typeorm/browser/find-options/operator/In.js';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  private normalizeCode(code: string) {
    return code.trim().toLowerCase();
  }
  async create(createPermissionDto: CreatePermissionDto) {
    const code = this.normalizeCode(createPermissionDto.code);
    const existed = await this.permissionRepository.findOne({
      where: {
        code,
      },
    });

    if (existed) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      code,
    });

    return this.permissionRepository.save(permission);
  }

  async createMany(createPermissionDtos: CreatePermissionDto[]) {
    if (createPermissionDtos.length === 0) {
      throw new BadRequestException('Permission list must not be empty');
    }

    const normalizedDtos = createPermissionDtos.map((dto) => ({
      ...dto,
      code: this.normalizeCode(dto.code),
    }));
    const codes = normalizedDtos.map((dto) => dto.code);
    const duplicateCodes = [
      ...new Set(codes.filter((code, index) => codes.indexOf(code) !== index)),
    ];

    if (duplicateCodes.length > 0) {
      throw new ConflictException(
        `Duplicate permission codes in request: ${duplicateCodes.join(', ')}`,
      );
    }

    const existingPermissions = await this.permissionRepository.find({
      where: { code: In(codes) },
    });

    if (existingPermissions.length > 0) {
      throw new ConflictException(
        `Permissions already exist: ${existingPermissions
          .map((permission) => permission.code)
          .join(', ')}`,
      );
    }

    return this.permissionRepository.manager.transaction(async (manager) => {
      const permissions = manager.create(Permission, normalizedDtos);
      return manager.save(Permission, permissions);
    });
  }
  async findAll() {
    return this.permissionRepository.find({
      order: {
        code: 'ASC',
      },
    });
  }

  async findByCode(codes: string[]) {
    const normalized = [...new Set(codes.map((c) => this.normalizeCode(c)))];
    if (normalized.length === 0) return [];
    return this.permissionRepository.find({ where: { code: In(normalized) } });
  }
  async findById(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException('Permission không tồn tại');
    }
    return permission;
  }

  async updateName(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findById(id);
    permission.name = updatePermissionDto.name.trim();
    return this.permissionRepository.save(permission);
  }

  async findByIds(ids: string[]) {
    if (!ids.length) {
      return [];
    }
    return this.permissionRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
}
