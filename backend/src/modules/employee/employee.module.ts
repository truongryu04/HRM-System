import { forwardRef, Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';
import { PositionModule } from '../position/position.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { DepartmentModule } from '../department/department.module';
import { WorkShiftsModule } from '../work-shifts/work-shifts.module';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
  imports: [
    TypeOrmModule.forFeature([Employee]),
    PositionModule,
    WorkShiftsModule,
    forwardRef(() => DepartmentModule),
  ],
})
export class EmployeeModule {}
