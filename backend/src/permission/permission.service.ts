import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { Permission } from './permission.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const existed = await this.permissionRepository.findOne({
      where: {
        name: createPermissionDto.name,
      },
    });

    if (existed) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);

    return this.permissionRepository.save(permission);
  }
  async findAll() {
    return this.permissionRepository.find();
  }
}
