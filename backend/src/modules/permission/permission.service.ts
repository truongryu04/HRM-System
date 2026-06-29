import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { Permission } from './permission.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { In } from 'typeorm/browser/find-options/operator/In.js';

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
    const existed = await this.permissionRepository.findOne({
      where: {
        code: this.normalizeCode(createPermissionDto.code),
      },
    });

    if (existed) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);

    return this.permissionRepository.save(permission);
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
