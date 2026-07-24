import 'reflect-metadata';
import 'dotenv/config';

import { hashPassword } from '../../common/utils/bcrypt.util';
import { LeaveType } from '../../modules/leave-request/entities/leave-type.entity';
import { Permission } from '../../modules/permission/permission.entity';
import { RequestType } from '../../modules/request/entities/request-type.entity';
import { Role } from '../../modules/role/role.entity';
import { User } from '../../modules/user/user.entity';
import { UserStatus } from '../../modules/user/user-status.enum';
import { WorkShift } from '../../modules/work-shifts/work-shifts.entity';
import AppDataSource from '../data-source';
import {
  defaultWorkShift,
  leaveTypes,
  permissionCodes,
  requestTypes,
} from './seed-data';

function permissionName(code: string): string {
  return code
    .split(/[:-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getAdminCredentials(): { email: string; password: string } {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !email.includes('@')) {
    throw new Error('SEED_ADMIN_EMAIL must be a valid email address');
  }
  if (!password || password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');
  }

  return { email, password };
}

async function seed(): Promise<void> {
  const { email, password } = getAdminCredentials();
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      const existingPermissionCodes = new Set(
        (
          await manager.find(Permission, {
            select: { code: true },
          })
        ).map((permission) => permission.code),
      );
      const missingPermissions = permissionCodes
        .filter((code) => !existingPermissionCodes.has(code))
        .map((code) => ({
          code,
          module: code.split(':')[0],
          name: permissionName(code),
        }));

      if (missingPermissions.length > 0) {
        await manager.insert(Permission, missingPermissions);
      }

      const permissions = await manager.find(Permission, {
        order: { code: 'ASC' },
      });

      await manager.upsert(
        Role,
        {
          name: 'admin',
          description: 'System administrator with all permissions',
          isDeleted: false,
        },
        ['name'],
      );
      const adminRole = await manager.findOneOrFail(Role, {
        where: { name: 'admin' },
        relations: { permissions: true },
      });
      adminRole.permissions = permissions;
      await manager.save(Role, adminRole);

      await manager.upsert(
        RequestType,
        requestTypes.map((requestType) => ({
          ...requestType,
          isActive: true,
          isDeleted: false,
        })),
        ['code'],
      );

      await manager.upsert(
        LeaveType,
        leaveTypes.map((leaveType) => ({
          ...leaveType,
          isActive: true,
          isDeleted: false,
        })),
        ['code'],
      );

      const existingDefaultShift = await manager.findOne(WorkShift, {
        where: { isDefault: true },
      });
      if (!existingDefaultShift) {
        await manager.save(
          WorkShift,
          manager.create(WorkShift, defaultWorkShift),
        );
      }

      const existingAdmin = await manager.findOne(User, {
        where: { email },
        relations: { roles: true },
      });

      if (existingAdmin) {
        existingAdmin.status = UserStatus.ACTIVE;
        existingAdmin.isDeleted = false;
        if (!existingAdmin.roles.some((role) => role.id === adminRole.id)) {
          existingAdmin.roles = [...existingAdmin.roles, adminRole];
        }
        await manager.save(User, existingAdmin);
      } else {
        await manager.save(
          User,
          manager.create(User, {
            email,
            password: await hashPassword(password),
            status: UserStatus.ACTIVE,
            isDeleted: false,
            roles: [adminRole],
          }),
        );
      }
    });

    console.log('Database seed completed successfully');
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Database seed failed: ${message}`);
  process.exitCode = 1;
});
