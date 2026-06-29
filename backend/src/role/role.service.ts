import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Role } from './role.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import CreateRoleDto from './dto/create-role.dto';
import { PermissionService } from 'src/permission/permission.service';
import { In } from 'typeorm/browser/find-options/operator/In.js';
import { UpdateRolePermissionsDto } from './dto/updateRolePermission.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly permissionService: PermissionService,
  ) {}
  private normalizeCode(code: string) {
    return code.trim().toLowerCase();
  }
  async create(createRoleData: CreateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: createRoleData.name },
    });
    if (role) {
      throw new ConflictException('Role đã tồn tại');
    }
    const newRole = this.roleRepository.create(createRoleData);
    return this.roleRepository.save(newRole);
  }
  async findById(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }
    return role;
  }
  async findByIds(ids: number[]): Promise<Role[]> {
    if (!ids.length) {
      return [];
    }
    return this.roleRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
  async setPermissions(roleId: number, permissionCodes: string[]) {
    const role = await this.findById(roleId);

    const normalizedPermissions = [
      ...new Set(permissionCodes.map((code) => this.normalizeCode(code))),
    ];

    const permissions = await this.permissionService.findByCode(
      normalizedPermissions,
    );

    if (permissions.length !== normalizedPermissions.length) {
      const foundPermissions = new Set(
        permissions.map((permission) => permission.code),
      );

      const missingPermissions = normalizedPermissions.filter(
        (permissionCode) => !foundPermissions.has(permissionCode),
      );

      throw new NotFoundException(
        `Permission không tồn tại: ${missingPermissions.join(', ')}`,
      );
    }

    role.permissions = permissions;

    return this.roleRepository.save(role);
  }

  async findAll() {
    const roles = await this.roleRepository.find({
      where: {
        isDeleted: false,
      },
      order: {
        name: 'ASC',
      },
      relations: {
        permissions: true,
      },
    });
    if (roles.length === 0) {
      throw new NotFoundException('Không có vai trò nào');
    }
    return roles;
  }

  async updatePermissions(roles: UpdateRolePermissionsDto[]) {
    for (const roleData of roles) {
      const role = await this.roleRepository.findOne({
        where: { id: roleData.roleId },
        relations: { permissions: true },
      });
      if (!role) {
        throw new NotFoundException(
          `Role với id ${roleData.roleId} không tồn tại`,
        );
      }
      const permissions = await this.permissionService.findByIds(
        roleData.permissionIds,
      );
      role.permissions = permissions;

      await this.roleRepository.save(role);
    }
  }
  async updateRole(id: number, body: CreateRoleDto) {
    const role = await this.findById(id);
    role.name = body.name;
    role.description = body.description;
    const existingRole = await this.roleRepository.findOne({
      where: { name: body.name },
    });
    if (existingRole && existingRole.id !== id) {
      throw new ConflictException('Role đã tồn tại');
    }

    return this.roleRepository.save(role);
  }
  async deleteRole(id: number) {
    const role = await this.findById(id);
    if (role.isDeleted) {
      throw new ConflictException('Role đã bị xóa trước đó');
    }
    role.isDeleted = true;
    return this.roleRepository.save(role);
  }
}
