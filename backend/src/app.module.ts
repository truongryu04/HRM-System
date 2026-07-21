import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import databaseConfig from './config/db.config';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { PositionModule } from './modules/position/position.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { WorkShiftsModule } from './modules/work-shifts/work-shifts.module';
import { LeaveRequestModule } from './modules/leave-request/leave-request.module';
import { RequestModule } from './modules/request/request.module';
import { MailModule } from './modules/mail/mail.module';
import { UserTokenModule } from './modules/user-token/user-token.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { LeaveBalanceModule } from './modules/leave-balance/leave-balance.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database config is undefined');
        }
        return {
          ...dbConfig,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    DepartmentModule,
    PositionModule,
    EmployeeModule,
    AttendanceModule,
    WorkShiftsModule,
    RequestModule,
    LeaveRequestModule,
    LeaveBalanceModule,
    MailModule,
    UserTokenModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
