import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/employee.entity';
import { User } from '../user/user.entity';
import { ApprovalFlowStep } from './entities/approval-flow-step.entity';
import { ApprovalStepTemplate } from './entities/approval-step-template.entity';
import { ApprovalFlow } from './entities/approval-flow.entity';
import { RequestApproval } from './entities/request-approval.entity';
import { RequestHistory } from './entities/request-history.entity';
import { Request } from './entities/request.entity';
import { RequestType } from './entities/request-type.entity';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

import { RequestConfigService } from './request-config.service';
import { RequestTypeController } from './request-type.controller';
import { ApprovalFlowController } from './approval-flow.controller';
import { ApprovalFlowStepController } from './approval-flow-step.controller';
import { ApprovalStepTemplateController } from './approval-step-template.controller';
import { RequestApprovedHandlerRegistry } from './request-approved-handler.registry';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RequestType,
      ApprovalFlow,
      ApprovalFlowStep,
      ApprovalStepTemplate,
      Request,
      RequestApproval,
      RequestHistory,
      Employee,
      User,
    ]),
  ],
  controllers: [
    RequestController,
    RequestTypeController,
    ApprovalStepTemplateController,
    ApprovalFlowStepController,
    ApprovalFlowController,
  ],
  providers: [
    RequestService,
    RequestConfigService,
    RequestApprovedHandlerRegistry,
  ],
  exports: [RequestService, RequestApprovedHandlerRegistry, TypeOrmModule],
})
export class RequestModule {}
