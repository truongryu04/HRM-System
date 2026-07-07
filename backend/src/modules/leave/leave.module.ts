import { Module } from '@nestjs/common';
import { LeaveRequestController } from './leave-request.controller';
import { LeaveRequestService } from './leave-request.service';
import { LeaveTypeService } from './leave-type.service';
import { LeaveType } from './leave-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { LeaveTypeController } from './leave-type.controller';
import { LeaveRequest } from './leave-request.entity';
import { Employee } from '../employee/employee.entity';
import { User } from '../user/user.entity';

@Module({
  controllers: [LeaveRequestController, LeaveTypeController],
  providers: [LeaveRequestService, LeaveTypeService],
  exports: [LeaveRequestService, LeaveTypeService],
  imports: [
    TypeOrmModule.forFeature([LeaveType, LeaveRequest, Employee, User]),
  ],
})
export class LeaveModule {}
