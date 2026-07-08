import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/employee.entity';
import { User } from '../user/user.entity';
import { ApprovalFlowStep } from './entities/approval-flow-step.entity';
import { ApprovalFlow } from './entities/approval-flow.entity';
import { RequestApproval } from './entities/request-approval.entity';
import { RequestHistory } from './entities/request-history.entity';
import { Request } from './entities/request.entity';
import { RequestType } from './entities/request-type.entity';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { LeaveRequest } from '../leave-request/entities/leave-request.entity';
import { LeaveRequestDay } from '../leave-request/entities/leave-request-day.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RequestType,
      ApprovalFlow,
      ApprovalFlowStep,
      Request,
      RequestApproval,
      RequestHistory,
      LeaveRequest,
      LeaveRequestDay,
      Employee,
      User,
    ]),
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService, TypeOrmModule],
})
export class RequestModule {}
