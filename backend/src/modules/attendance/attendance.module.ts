import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from './attendance.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { EmployeeModule } from '../employee/employee.module';
import { DepartmentModule } from '../department/department.module';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    EmployeeModule,
    DepartmentModule,
  ],
})
export class AttendanceModule {}
