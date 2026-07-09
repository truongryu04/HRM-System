import {
  BadRequestException,
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
import { ApprovalStepTemplate } from './entities/approval-step-template.entity';
import { ApprovalFlow } from './entities/approval-flow.entity';
import { Request } from './entities/request.entity';
import { RequestType } from './entities/request-type.entity';
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';
import { CreateApprovalStepTemplateDto } from './dto/create-approval-step-template.dto';
import { UpdateApprovalStepTemplateDto } from './dto/update-approval-step-template.dto';
import { CreateApprovalFlowStepFromTemplateDto } from './dto/create-approval-flow-step-from-template.dto';
import { CreateApprovalFlowStepsFromTemplatesDto } from './dto/create-approval-flow-steps-from-templates.dto';
import { UpdateApprovalFlowStepFromTemplateDto } from './dto/update-approval-flow-step-from-template.dto';
import { ApproverType } from './enums/approver-type.enum';

@Injectable()
export class RequestConfigService {
  constructor(
    @InjectRepository(RequestType)
    private readonly requestTypeRepository: Repository<RequestType>,

    @InjectRepository(ApprovalFlow)
    private readonly approvalFlowRepository: Repository<ApprovalFlow>,

    @InjectRepository(ApprovalFlowStep)
    private readonly approvalFlowStepRepository: Repository<ApprovalFlowStep>,

    @InjectRepository(ApprovalStepTemplate)
    private readonly approvalStepTemplateRepository: Repository<ApprovalStepTemplate>,

    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createRequestType(dto: CreateRequestTypeDto): Promise<RequestType> {
    const code = this.normalizeCode(dto.code);
    const existed = await this.requestTypeRepository.findOne({
      where: { code, isDeleted: false },
    });
    if (existed) {
      throw new ConflictException('Request type code đã tồn tại');
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
      throw new NotFoundException('Không tìm thấy request type');
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
      throw new NotFoundException('Không tìm thấy request type');
    }

    const requestCount = await this.requestRepository.count({
      where: { requestType: { id } },
    });
    if (requestCount > 0) {
      throw new BadRequestException('Không thể xóa request type đã có request');
    }

    requestType.isDeleted = true;
    requestType.isActive = false;
    await this.requestTypeRepository.save(requestType);

    return { message: 'Xóa request type thành công' };
  }
  async createApprovalFlow(dto: CreateApprovalFlowDto): Promise<ApprovalFlow> {
    const requestType = await this.findOneRequestType(dto.requestTypeId);
    if (dto.isDefault) {
      await this.unsetDefaultFlows(requestType.id);
    }

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
      throw new NotFoundException('Không tìm thấy approval flow');
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
      if (dto.isDefault) {
        await this.unsetDefaultFlows(approvalFlow.requestType.id);
      }
      approvalFlow.isDefault = dto.isDefault;
    }

    return this.approvalFlowRepository.save(approvalFlow);
  }

  async removeApprovalFlow(id: number): Promise<{ message: string }> {
    const approvalFlow = await this.findOneApprovalFlow(id);

    const requestCount = await this.requestRepository.count({
      where: { approvalFlow: { id } },
    });
    if (requestCount > 0) {
      throw new BadRequestException(
        'Không thể xóa approval flow đã có request',
      );
    }

    approvalFlow.isDeleted = true;
    approvalFlow.isActive = false;
    approvalFlow.isDefault = false;
    await this.approvalFlowRepository.save(approvalFlow);

    return { message: 'Xóa approval flow thành công' };
  }

  async createApprovalFlowStepFromTemplate(
    flowId: number,
    dto: CreateApprovalFlowStepFromTemplateDto,
  ): Promise<ApprovalFlowStep> {
    const flow = await this.findOneApprovalFlow(flowId);
    const template = await this.findOneApprovalStepTemplate(dto.templateId);
    const stepOrder =
      dto.stepOrder ?? (await this.getNextStepOrderForFlow(flow.id));
    await this.assertStepOrderAvailable(flow.id, stepOrder);

    const step = this.approvalFlowStepRepository.create({
      flow,
      approvalStepTemplate: template,
      stepOrder,
      stepName: template.stepName,
      approverType: template.approverType,
      roleCode: template.roleCode,
      positionCode: template.positionCode,
      specificUser: template.specificUser,
      condition: template.condition,
      isDeleted: false,
    });

    return this.approvalFlowStepRepository.save(step);
  }

  async createApprovalFlowStepsFromTemplates(
    flowId: number,
    dto: CreateApprovalFlowStepsFromTemplatesDto,
  ): Promise<ApprovalFlowStep[]> {
    const flow = await this.findOneApprovalFlow(flowId);
    let stepOrder =
      dto.startStepOrder ?? (await this.getNextStepOrderForFlow(flow.id));

    const steps: ApprovalFlowStep[] = [];
    for (const templateId of dto.templateIds) {
      const template = await this.findOneApprovalStepTemplate(templateId);
      await this.assertStepOrderAvailable(flow.id, stepOrder);

      steps.push(
        this.approvalFlowStepRepository.create({
          flow,
          approvalStepTemplate: template,
          stepOrder,
          stepName: template.stepName,
          approverType: template.approverType,
          roleCode: template.roleCode,
          positionCode: template.positionCode,
          specificUser: template.specificUser,
          condition: template.condition,
          isDeleted: false,
        }),
      );

      stepOrder += 1;
    }

    return this.approvalFlowStepRepository.save(steps);
  }

  async findStepsByFlow(flowId: number): Promise<ApprovalFlowStep[]> {
    await this.findOneApprovalFlow(flowId);

    return this.approvalFlowStepRepository.find({
      where: { flow: { id: flowId }, isDeleted: false },
      relations: { flow: true, approvalStepTemplate: true, specificUser: true },
      order: { stepOrder: 'ASC' },
    });
  }

  async findOneApprovalFlowStep(id: number): Promise<ApprovalFlowStep> {
    const step = await this.approvalFlowStepRepository.findOne({
      where: { id, isDeleted: false },
      relations: { flow: true, approvalStepTemplate: true, specificUser: true },
    });

    if (!step) {
      throw new NotFoundException('Không tìm thấy approval flow step');
    }

    return step;
  }

  async updateApprovalFlowStepFromTemplate(
    id: number,
    dto: UpdateApprovalFlowStepFromTemplateDto,
  ): Promise<ApprovalFlowStep> {
    const step = await this.findOneApprovalFlowStep(id);
    const template = await this.findOneApprovalStepTemplate(dto.templateId);

    if (dto.stepOrder !== undefined) {
      await this.assertStepOrderAvailable(step.flow.id, dto.stepOrder, step.id);
      step.stepOrder = dto.stepOrder;
    }

    step.approvalStepTemplate = template;
    step.stepName = template.stepName;
    step.approverType = template.approverType;
    step.roleCode = template.roleCode;
    step.positionCode = template.positionCode;
    step.specificUser = template.specificUser;
    step.condition = template.condition;

    return this.approvalFlowStepRepository.save(step);
  }

  async removeApprovalFlowStep(id: number): Promise<{ message: string }> {
    const step = await this.findOneApprovalFlowStep(id);

    step.isDeleted = true;
    await this.approvalFlowStepRepository.save(step);

    return { message: 'Xoa approval flow step thanh cong' };
  }

  async createApprovalStepTemplate(
    dto: CreateApprovalStepTemplateDto,
  ): Promise<ApprovalStepTemplate> {
    this.validateApproverConfig(dto);
    const specificUser = dto.specificUserId
      ? await this.findSpecificUser(dto.specificUserId)
      : undefined;

    const template = this.approvalStepTemplateRepository.create({
      stepName: dto.stepName.trim(),
      approverType: dto.approverType,
      roleCode: dto.roleCode,
      positionCode: dto.positionCode,
      specificUser,
      condition: dto.condition,
      isDeleted: false,
    });

    return this.approvalStepTemplateRepository.save(template);
  }

  findAllApprovalStepTemplates(): Promise<ApprovalStepTemplate[]> {
    return this.approvalStepTemplateRepository.find({
      where: { isDeleted: false },
      relations: { specificUser: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneApprovalStepTemplate(id: number): Promise<ApprovalStepTemplate> {
    const template = await this.approvalStepTemplateRepository.findOne({
      where: { id, isDeleted: false },
      relations: { specificUser: true },
    });

    if (!template) {
      throw new NotFoundException('Không tìm thấy approval step template');
    }

    return template;
  }

  async updateApprovalStepTemplate(
    id: number,
    dto: UpdateApprovalStepTemplateDto,
  ): Promise<ApprovalStepTemplate> {
    const template = await this.findOneApprovalStepTemplate(id);

    if (dto.stepName !== undefined) {
      template.stepName = dto.stepName.trim();
    }
    if (dto.approverType !== undefined) {
      template.approverType = dto.approverType;
    }
    if (dto.roleCode !== undefined) {
      template.roleCode = dto.roleCode;
    }
    if (dto.positionCode !== undefined) {
      template.positionCode = dto.positionCode;
    }
    if (dto.specificUserId !== undefined) {
      template.specificUser = dto.specificUserId
        ? await this.findSpecificUser(dto.specificUserId)
        : undefined;
    }
    if (dto.condition !== undefined) {
      template.condition = dto.condition;
    }

    this.validateApproverConfig({
      approverType: template.approverType,
      roleCode: template.roleCode,
      positionCode: template.positionCode,
      specificUserId: template.specificUser?.id,
    });

    return this.approvalStepTemplateRepository.save(template);
  }

  async removeApprovalStepTemplate(id: number): Promise<{ message: string }> {
    const template = await this.findOneApprovalStepTemplate(id);

    template.isDeleted = true;
    await this.approvalStepTemplateRepository.save(template);

    return { message: 'Xóa approval step template thành công' };
  }

  private async getNextStepOrderForFlow(flowId: number): Promise<number> {
    const lastStep = await this.approvalFlowStepRepository.findOne({
      where: { flow: { id: flowId }, isDeleted: false },
      order: { stepOrder: 'DESC' },
    });

    return (lastStep?.stepOrder ?? 0) + 1;
  }

  private async findSpecificUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    return user;
  }

  private async unsetDefaultFlows(requestTypeId: number): Promise<void> {
    await this.approvalFlowRepository
      .createQueryBuilder()
      .update(ApprovalFlow)
      .set({ isDefault: false })
      .where('request_type_id = :requestTypeId', { requestTypeId })
      .andWhere('"isDeleted" = false')
      .execute();
  }

  private async assertStepOrderAvailable(
    flowId: number,
    stepOrder: number,
    ignoredStepId?: number,
  ): Promise<void> {
    const existed = await this.approvalFlowStepRepository.findOne({
      where: { flow: { id: flowId }, stepOrder, isDeleted: false },
    });

    if (existed && existed.id !== ignoredStepId) {
      throw new ConflictException('Step order da ton tai trong flow');
    }
  }

  private validateApproverConfig(
    dto: Pick<
      CreateApprovalStepTemplateDto,
      'approverType' | 'roleCode' | 'positionCode' | 'specificUserId'
    >,
  ): void {
    if (dto.approverType === ApproverType.ROLE && !dto.roleCode) {
      throw new BadRequestException('ROLE approver can co roleCode');
    }

    if (dto.approverType === ApproverType.POSITION && !dto.positionCode) {
      throw new BadRequestException('POSITION approver can co positionCode');
    }

    if (
      dto.approverType === ApproverType.SPECIFIC_USER &&
      !dto.specificUserId
    ) {
      throw new BadRequestException(
        'SPECIFIC_USER approver can co specificUserId',
      );
    }
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }
}
