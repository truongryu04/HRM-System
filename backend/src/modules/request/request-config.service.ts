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

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }
}
