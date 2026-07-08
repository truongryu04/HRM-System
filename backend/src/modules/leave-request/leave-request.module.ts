import { Module } from '@nestjs/common';
import { LeaveRequestController } from './leave-request.controller';
import { LeaveRequestService } from './leave-request.service';
import { LeaveTypeService } from './leave-type.service';
import { LeaveType } from './entities/leave-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { LeaveTypeController } from './leave-type.controller';
import { LeaveRequest } from './entities/leave-request.entity';
import { RequestModule } from '../request/request.module';
import { LeaveRequestDay } from './entities/leave-request-day.entity';

@Module({
  controllers: [LeaveRequestController, LeaveTypeController],
  providers: [LeaveRequestService, LeaveTypeService],
  exports: [LeaveRequestService, LeaveTypeService],
  imports: [
    TypeOrmModule.forFeature([LeaveType, LeaveRequest, LeaveRequestDay]),
    RequestModule,
  ],
})
export class LeaveRequestModule {}
