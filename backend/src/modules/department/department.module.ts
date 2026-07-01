import { forwardRef, Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department } from './department.entity';

import { EmployeeModule } from '../employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
  imports: [
    TypeOrmModule.forFeature([Department]),
    forwardRef(() => EmployeeModule),
  ],
})
export class DepartmentModule {}
