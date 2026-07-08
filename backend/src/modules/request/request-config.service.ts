import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

import { CreateRequestTypeDto } from './dto/create-request-type.dto';

import { UpdateRequestTypeDto } from './dto/update-request-type.dto';
import { ApprovalFlowStep } from './entities/approval-flow-step.entity';
import { ApprovalFlow } from './entities/approval-flow.entity';
import { RequestType } from './entities/request-type.entity';
import { UpdateApprovalFlowStepDto } from './dto/update-approval-flow-step.dto';
import { CreateApprovalFlowStepDto } from './dto/create-approval-flow-step.dto';
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';

@Injectable()
export class RequestConfigService {
  constructor(
    @InjectRepository(RequestType)
    private readonly requestTypeRepository: Repository<RequestType>,

    @InjectRepository(ApprovalFlow)
    private readonly approvalFlowRepository: Repository<ApprovalFlow>,

    @InjectRepository(ApprovalFlowStep)
    private readonly approvalFlowStepRepository: Repository<ApprovalFlowStep>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createRequestType(dto: CreateRequestTypeDto): Promise<RequestType> {
    const code = this.normalizeCode(dto.code);
    const existed = await this.requestTypeRepository.findOne({
      where: { code, isDeleted: false },
    });
    if (existed) {
      throw new ConflictException('Request type code da ton tai');
    }

    const requestType = this.requestTypeRepository.create({
      ...dto,
      code,
      name: dto.name.trim(),
      isActive: dto.isActive ?? true,
      isDeleted: false,
    });

    return this.requestTypeRepository.save(requestType);
  }

  findAllRequestTypes(): Promise<RequestType[]> {
    return this.requestTypeRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneRequestType(id: number): Promise<RequestType> {
    const requestType = await this.requestTypeRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!requestType) {
      throw new NotFoundException('Khong tim thay request type');
    }

    return requestType;
  }

  async updateRequestType(
    id: number,
    dto: UpdateRequestTypeDto,
  ): Promise<RequestType> {
    const requestType = await this.findOneRequestType(id);

    if (dto.code) {
      const code = this.normalizeCode(dto.code);
      const existed = await this.requestTypeRepository.findOne({
        where: { code, isDeleted: false },
      });
      if (existed && existed.id !== id) {
        throw new ConflictException('Request type code da ton tai');
      }
      requestType.code = code;
    }

    if (dto.name !== undefined) {
      requestType.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      requestType.description = dto.description;
    }
    if (dto.isActive !== undefined) {
      requestType.isActive = dto.isActive;
    }
    if (dto.handlerKey !== undefined) {
      requestType.handlerKey = dto.handlerKey;
    }

    return this.requestTypeRepository.save(requestType);
  }

  async removeRequestType(id: number): Promise<{ message: string }> {
    const requestType = await this.requestTypeRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!requestType) {
      throw new NotFoundException('Khong tim thay request type');
    }

    requestType.isDeleted = true;
    requestType.isActive = false;
    await this.requestTypeRepository.save(requestType);

    return { message: 'Xoa request type thanh cong' };
  }
  async createApprovalFlow(dto: CreateApprovalFlowDto): Promise<ApprovalFlow> {
    const requestType = await this.findOneRequestType(dto.requestTypeId);
    const approvalFlow = this.approvalFlowRepository.create({
      requestType,
      name: dto.name.trim(),
      isActive: dto.isActive ?? true,
      isDefault: dto.isDefault ?? false,
      isDeleted: false,
    });

    return this.approvalFlowRepository.save(approvalFlow);
  }

  findAllApprovalFlows(requestTypeId?: number): Promise<ApprovalFlow[]> {
    return this.approvalFlowRepository.find({
      where: {
        isDeleted: false,
        ...(requestTypeId ? { requestType: { id: requestTypeId } } : {}),
      },
      relations: { requestType: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneApprovalFlow(id: number): Promise<ApprovalFlow> {
    const approvalFlow = await this.approvalFlowRepository.findOne({
      where: { id, isDeleted: false },
      relations: { requestType: true },
    });

    if (!approvalFlow) {
      throw new NotFoundException('Khong tim thay approval flow');
    }

    return approvalFlow;
  }

  async updateApprovalFlow(
    id: number,
    dto: UpdateApprovalFlowDto,
  ): Promise<ApprovalFlow> {
    const approvalFlow = await this.findOneApprovalFlow(id);

    if (dto.requestTypeId !== undefined) {
      approvalFlow.requestType = await this.findOneRequestType(
        dto.requestTypeId,
      );
    }
    if (dto.name !== undefined) {
      approvalFlow.name = dto.name.trim();
    }
    if (dto.isActive !== undefined) {
      approvalFlow.isActive = dto.isActive;
    }
    if (dto.isDefault !== undefined) {
      approvalFlow.isDefault = dto.isDefault;
    }

    return this.approvalFlowRepository.save(approvalFlow);
  }

  async removeApprovalFlow(id: number): Promise<{ message: string }> {
    const approvalFlow = await this.findOneApprovalFlow(id);

    approvalFlow.isDeleted = true;
    approvalFlow.isActive = false;
    await this.approvalFlowRepository.save(approvalFlow);

    return { message: 'Xoa approval flow thanh cong' };
  }

  async createApprovalFlowStep(
    flowId: number,
    dto: CreateApprovalFlowStepDto,
  ): Promise<ApprovalFlowStep> {
    const flow = await this.findOneApprovalFlow(flowId);
    const specificUser = dto.specificUserId
      ? await this.findSpecificUser(dto.specificUserId)
      : undefined;

    const step = this.approvalFlowStepRepository.create({
      flow,
      stepOrder: dto.stepOrder,
      stepName: dto.stepName.trim(),
      approverType: dto.approverType,
      roleCode: dto.roleCode,
      permissionCode: dto.permissionCode,
      specificUser,
      condition: dto.condition,
      isDeleted: false,
    });

    return this.approvalFlowStepRepository.save(step);
  }

  async findStepsByFlow(flowId: number): Promise<ApprovalFlowStep[]> {
    await this.findOneApprovalFlow(flowId);

    return this.approvalFlowStepRepository.find({
      where: { flow: { id: flowId }, isDeleted: false },
      relations: { flow: true, specificUser: true },
      order: { stepOrder: 'ASC' },
    });
  }

  async findOneApprovalFlowStep(id: number): Promise<ApprovalFlowStep> {
    const step = await this.approvalFlowStepRepository.findOne({
      where: { id, isDeleted: false },
      relations: { flow: true, specificUser: true },
    });

    if (!step) {
      throw new NotFoundException('Khong tim thay approval flow step');
    }

    return step;
  }

  async updateApprovalFlowStep(
    id: number,
    dto: UpdateApprovalFlowStepDto,
  ): Promise<ApprovalFlowStep> {
    const step = await this.findOneApprovalFlowStep(id);

    if (dto.stepOrder !== undefined) {
      step.stepOrder = dto.stepOrder;
    }
    if (dto.stepName !== undefined) {
      step.stepName = dto.stepName.trim();
    }
    if (dto.approverType !== undefined) {
      step.approverType = dto.approverType;
    }
    if (dto.roleCode !== undefined) {
      step.roleCode = dto.roleCode;
    }
    if (dto.permissionCode !== undefined) {
      step.permissionCode = dto.permissionCode;
    }
    if (dto.specificUserId !== undefined) {
      step.specificUser = dto.specificUserId
        ? await this.findSpecificUser(dto.specificUserId)
        : undefined;
    }
    if (dto.condition !== undefined) {
      step.condition = dto.condition;
    }

    return this.approvalFlowStepRepository.save(step);
  }

  async removeApprovalFlowStep(id: number): Promise<{ message: string }> {
    const step = await this.findOneApprovalFlowStep(id);

    step.isDeleted = true;
    await this.approvalFlowStepRepository.save(step);

    return { message: 'Xoa approval flow step thanh cong' };
  }

  private async findSpecificUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Khong tim thay user');
    }

    return user;
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }
}
