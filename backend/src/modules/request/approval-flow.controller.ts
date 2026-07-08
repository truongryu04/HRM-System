import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';
import { CreateApprovalFlowStepDto } from './dto/create-approval-flow-step.dto';
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard)
@Controller('approval-flows')
export class ApprovalFlowController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Post()
  create(@Body() dto: CreateApprovalFlowDto) {
    return this.requestConfigService.createApprovalFlow(dto);
  }

  @Get()
  findAll(@Query('requestTypeId') requestTypeId?: string) {
    return this.requestConfigService.findAllApprovalFlows(
      requestTypeId ? Number(requestTypeId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneApprovalFlow(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApprovalFlowDto,
  ) {
    return this.requestConfigService.updateApprovalFlow(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeApprovalFlow(id);
  }

  @Post(':flowId/steps')
  createStep(
    @Param('flowId', ParseIntPipe) flowId: number,
    @Body() dto: CreateApprovalFlowStepDto,
  ) {
    return this.requestConfigService.createApprovalFlowStep(flowId, dto);
  }

  @Get(':flowId/steps')
  findSteps(@Param('flowId', ParseIntPipe) flowId: number) {
    return this.requestConfigService.findStepsByFlow(flowId);
  }
}
