import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';
import { PositionModule } from '../position/position.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { DepartmentModule } from '../department/department.module';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [
    TypeOrmModule.forFeature([Employee]),
    PositionModule,
    DepartmentModule,
  ],
})
export class EmployeeModule {}
