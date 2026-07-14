import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { RoleModule } from '../role/role.module';
import { EmployeeModule } from '../employee/employee.module';
import { UserTokenModule } from '../user-token/user-token.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User]),
    RoleModule,
    EmployeeModule,
    UserTokenModule,
  ],
})
export class UserModule {}
