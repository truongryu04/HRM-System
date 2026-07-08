import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Like, Repository } from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { LeaveRequestDay } from '../leave-request/entities/leave-request-day.entity';
import { LeaveRequest } from '../leave-request/entities/leave-request.entity';
import { LeaveSession } from '../leave-request/enums/leave-session.enum';
import { User } from '../user/user.entity';
import type { JwtUser } from '../auth/jwt-user.interface';
import { ApprovalFlowStep } from './entities/approval-flow-step.entity';
import { ApprovalFlow } from './entities/approval-flow.entity';
import { ApproverType } from './enums/approver-type.enum';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestApprovalStatus } from './enums/request-approval-status.enum';
import { RequestApproval } from './entities/request-approval.entity';
import { RequestHistory } from './entities/request-history.entity';
import { RequestStatus } from './enums/request-status.enum';
import { Request } from './entities/request.entity';
import { RequestTypeCode } from './enums/request-type-code.enum';
import { RequestType } from './entities/request-type.entity';

interface CreateBusinessRequestInput {
  requestTypeCode: RequestTypeCode;
  employee: Employee;
  createdBy: User;
  title: string;
  note?: string;
}

@Injectable()
export class RequestService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(RequestApproval)
    private readonly requestApprovalRepository: Repository<RequestApproval>,
  ) {}

  async createBusinessRequest(
    input: CreateBusinessRequestInput,
    manager: EntityManager,
  ): Promise<Request> {
    const requestType = await this.ensureRequestType(
      input.requestTypeCode,
      manager,
    );
    const flow = await this.ensureDefaultFlow(requestType, manager);
    const steps = await manager.find(ApprovalFlowStep, {
      where: { flow: { id: flow.id } },
      relations: { specificUser: true },
      order: { stepOrder: 'ASC' },
    });

    if (steps.length === 0) {
      throw new BadRequestException('Luong duyet chua co buoc duyet');
    }

    const request = manager.create(Request, {
      code: await this.generateRequestCode(manager),
      requestType,
      employee: input.employee,
      createdBy: input.createdBy,
      title: input.title,
      status: RequestStatus.PENDING,
      currentStepOrder: steps[0].stepOrder,
      approvalFlow: flow,
      note: input.note,
    });
    await manager.save(Request, request);

    const approvals = steps.map((step, index) =>
      manager.create(RequestApproval, {
        request,
        stepOrder: step.stepOrder,
        stepName: step.stepName,
        approverType: step.approverType,
        roleCode: step.roleCode,
        permissionCode: step.permissionCode,
        specificUser: step.specificUser,
        status:
          index === 0
            ? RequestApprovalStatus.PENDING
            : RequestApprovalStatus.WAITING,
      }),
    );
    await manager.save(RequestApproval, approvals);

    await this.addHistory(manager, request, input.createdBy, 'CREATED');

    return request;
  }

  findAll(): Promise<Request[]> {
    return this.requestRepository.find({
      relations: {
        requestType: true,
        employee: true,
        createdBy: true,
        finalApprovedBy: true,
        rejectedBy: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  findMyRequests(user: JwtUser): Promise<Request[]> {
    return this.requestRepository.find({
      where: { employee: { id: user.employeeId } },
      relations: {
        requestType: true,
        employee: true,
        createdBy: true,
        finalApprovedBy: true,
        rejectedBy: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingApproval(user: JwtUser): Promise<Request[]> {
    const approvals = await this.requestApprovalRepository.find({
      where: { status: RequestApprovalStatus.PENDING },
      relations: {
        request: {
          requestType: true,
          employee: true,
          createdBy: true,
        },
        specificUser: true,
      },
      order: { stepOrder: 'ASC' },
    });

    const allowed: Request[] = [];
    for (const approval of approvals) {
      if (await this.canUserApproveStep(user, approval, approval.request)) {
        allowed.push(approval.request);
      }
    }

    return allowed;
  }

  async findOne(id: number): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: {
        requestType: true,
        employee: true,
        createdBy: true,
        finalApprovedBy: true,
        rejectedBy: true,
        approvalFlow: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Khong tim thay yeu cau');
    }

    return request;
  }

  async findApprovals(requestId: number): Promise<RequestApproval[]> {
    return this.requestApprovalRepository.find({
      where: { request: { id: requestId } },
      relations: { actedBy: true, specificUser: true },
      order: { stepOrder: 'ASC' },
    });
  }

  async approve(
    requestId: number,
    user: JwtUser,
    dto: ApproveRequestDto,
  ): Promise<Request> {
    return this.dataSource.transaction(async (manager) => {
      const request = await this.findRequestForAction(manager, requestId);
      this.assertRequestCanBeProcessed(request);

      const currentApproval = await this.findCurrentApproval(
        manager,
        request.id,
      );
      if (!(await this.canUserApproveStep(user, currentApproval, request))) {
        throw new ForbiddenException('Ban khong co quyen duyet buoc nay');
      }

      currentApproval.status = RequestApprovalStatus.APPROVED;
      currentApproval.actedBy = { id: user.id } as User;
      currentApproval.actedAt = new Date();
      currentApproval.note = dto.note;
      await manager.save(RequestApproval, currentApproval);

      await this.addHistory(
        manager,
        request,
        { id: user.id } as User,
        'APPROVED_STEP',
        dto.note,
        { stepOrder: currentApproval.stepOrder },
      );

      const nextApproval = await manager.findOne(RequestApproval, {
        where: {
          request: { id: request.id },
          status: RequestApprovalStatus.WAITING,
        },
        order: { stepOrder: 'ASC' },
      });

      if (nextApproval) {
        nextApproval.status = RequestApprovalStatus.PENDING;
        await manager.save(RequestApproval, nextApproval);

        request.status = RequestStatus.IN_PROGRESS;
        request.currentStepOrder = nextApproval.stepOrder;
        return manager.save(Request, request);
      }

      request.status = RequestStatus.APPROVED;
      request.finalApprovedBy = { id: user.id } as User;
      request.finalApprovedAt = new Date();
      const saved = await manager.save(Request, request);

      await this.runAfterApprovedHandler(saved, manager);
      await this.addHistory(
        manager,
        saved,
        { id: user.id } as User,
        'FINAL_APPROVED',
        dto.note,
      );

      return saved;
    });
  }

  async reject(
    requestId: number,
    user: JwtUser,
    dto: RejectRequestDto,
  ): Promise<Request> {
    return this.dataSource.transaction(async (manager) => {
      const request = await this.findRequestForAction(manager, requestId);
      this.assertRequestCanBeProcessed(request);

      const currentApproval = await this.findCurrentApproval(
        manager,
        request.id,
      );
      if (!(await this.canUserApproveStep(user, currentApproval, request))) {
        throw new ForbiddenException('Ban khong co quyen tu choi buoc nay');
      }

      currentApproval.status = RequestApprovalStatus.REJECTED;
      currentApproval.actedBy = { id: user.id } as User;
      currentApproval.actedAt = new Date();
      currentApproval.note = dto.reason;
      await manager.save(RequestApproval, currentApproval);

      request.status = RequestStatus.REJECTED;
      request.rejectedBy = { id: user.id } as User;
      request.rejectedAt = new Date();
      request.rejectionReason = dto.reason;
      const saved = await manager.save(Request, request);

      await this.addHistory(
        manager,
        saved,
        { id: user.id } as User,
        'REJECTED',
        dto.reason,
        { stepOrder: currentApproval.stepOrder },
      );

      return saved;
    });
  }

  async cancel(requestId: number, user: JwtUser): Promise<Request> {
    return this.dataSource.transaction(async (manager) => {
      const request = await this.findRequestForAction(manager, requestId);

      if (request.employee.id !== user.employeeId) {
        throw new ForbiddenException('Ban chi duoc huy yeu cau cua minh');
      }

      if (
        ![RequestStatus.PENDING, RequestStatus.IN_PROGRESS].includes(
          request.status,
        )
      ) {
        throw new BadRequestException('Khong the huy yeu cau da xu ly');
      }

      request.status = RequestStatus.CANCELLED;
      const saved = await manager.save(Request, request);

      await this.addHistory(
        manager,
        saved,
        { id: user.id } as User,
        'CANCELLED',
      );

      return saved;
    });
  }

  private async ensureRequestType(
    code: RequestTypeCode,
    manager: EntityManager,
  ): Promise<RequestType> {
    let requestType = await manager.findOne(RequestType, { where: { code } });
    if (requestType) {
      return requestType;
    }

    requestType = manager.create(RequestType, {
      code,
      name: code === RequestTypeCode.LEAVE_REQUEST ? 'Xin nghi phep' : code,
      handlerKey:
        code === RequestTypeCode.LEAVE_REQUEST ? 'leave-request' : undefined,
      isActive: true,
    });

    return manager.save(RequestType, requestType);
  }

  private async ensureDefaultFlow(
    requestType: RequestType,
    manager: EntityManager,
  ): Promise<ApprovalFlow> {
    let flow = await manager.findOne(ApprovalFlow, {
      where: {
        requestType: { id: requestType.id },
        isDefault: true,
        isActive: true,
      },
    });
    if (flow) {
      return flow;
    }

    flow = manager.create(ApprovalFlow, {
      requestType,
      name:
        requestType.code === RequestTypeCode.LEAVE_REQUEST
          ? 'Nghi phep 1 cap'
          : `${requestType.name} mac dinh`,
      isActive: true,
      isDefault: true,
    });
    await manager.save(ApprovalFlow, flow);

    await manager.save(
      ApprovalFlowStep,
      manager.create(ApprovalFlowStep, {
        flow,
        stepOrder: 1,
        stepName: 'Manager duyet',
        approverType: ApproverType.DIRECT_MANAGER,
      }),
    );

    return flow;
  }

  private async generateRequestCode(manager: EntityManager): Promise<string> {
    const today = new Date();
    const ymd = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `REQ-${ymd}`;
    const count = await manager.count(Request, {
      where: { code: Like(`${prefix}%`) },
    });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  private async findRequestForAction(
    manager: EntityManager,
    requestId: number,
  ): Promise<Request> {
    const request = await manager.findOne(Request, {
      where: { id: requestId },
      relations: {
        requestType: true,
        employee: true,
        createdBy: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Khong tim thay yeu cau');
    }

    return request;
  }

  private assertRequestCanBeProcessed(request: Request): void {
    if (
      ![RequestStatus.PENDING, RequestStatus.IN_PROGRESS].includes(
        request.status,
      )
    ) {
      throw new BadRequestException('Yeu cau khong con o trang thai cho duyet');
    }
  }

  private async findCurrentApproval(
    manager: EntityManager,
    requestId: number,
  ): Promise<RequestApproval> {
    const approval = await manager.findOne(RequestApproval, {
      where: {
        request: { id: requestId },
        status: RequestApprovalStatus.PENDING,
      },
      relations: { specificUser: true },
      order: { stepOrder: 'ASC' },
    });

    if (!approval) {
      throw new BadRequestException('Khong tim thay buoc duyet hien tai');
    }

    return approval;
  }

  private async canUserApproveStep(
    user: JwtUser,
    approval: RequestApproval,
    request: Request,
  ): Promise<boolean> {
    const roles = (user.roles ?? []).map((role) => role.toLowerCase());
    const permissions = user.permissions ?? [];

    if (approval.approverType === ApproverType.ADMIN) {
      return roles.includes('admin');
    }

    if (approval.approverType === ApproverType.HR) {
      return roles.includes('hr');
    }

    if (approval.approverType === ApproverType.ROLE) {
      return roles.includes((approval.roleCode ?? '').toLowerCase());
    }

    if (approval.approverType === ApproverType.PERMISSION) {
      return permissions.includes(approval.permissionCode ?? '');
    }

    if (approval.approverType === ApproverType.SPECIFIC_USER) {
      return approval.specificUser?.id === user.id;
    }

    if (approval.approverType === ApproverType.DIRECT_MANAGER) {
      return (
        roles.includes('manager') && request.employee.id !== user.employeeId
      );
    }

    return false;
  }

  private async runAfterApprovedHandler(
    request: Request,
    manager: EntityManager,
  ): Promise<void> {
    if (request.requestType.code !== RequestTypeCode.LEAVE_REQUEST) {
      return;
    }

    const leaveRequest = await manager.findOne(LeaveRequest, {
      where: { request: { id: request.id } },
      relations: { request: { employee: true }, leaveType: true },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Khong tim thay don nghi phep');
    }

    const existingDays = await manager.count(LeaveRequestDay, {
      where: { leaveRequest: { id: leaveRequest.id } },
    });
    if (existingDays > 0) {
      return;
    }

    const days = this.buildLeaveDays(leaveRequest);
    await manager.save(LeaveRequestDay, days);
  }

  private buildLeaveDays(leaveRequest: LeaveRequest): LeaveRequestDay[] {
    const days: LeaveRequestDay[] = [];
    const current = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);

    while (current <= end) {
      days.push(
        this.requestRepository.manager.create(LeaveRequestDay, {
          leaveRequest,
          employee: leaveRequest.request.employee,
          date: current.toISOString().slice(0, 10),
          value: 1,
          session: LeaveSession.FULL,
          isPaid: leaveRequest.leaveType.isPaid,
          deductFromBalance: true,
        }),
      );
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  private addHistory(
    manager: EntityManager,
    request: Request,
    actor: User,
    action: string,
    note?: string,
    metadata?: Record<string, unknown>,
  ): Promise<RequestHistory> {
    return manager.save(
      RequestHistory,
      manager.create(RequestHistory, {
        request,
        actor,
        action,
        note,
        metadata,
      }),
    );
  }
}
