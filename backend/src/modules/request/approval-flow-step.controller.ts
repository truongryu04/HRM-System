import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CreateApprovalFlowStepFromTemplateDto } from './dto/create-approval-flow-step-from-template.dto';
import { CreateApprovalFlowStepsFromTemplatesDto } from './dto/create-approval-flow-steps-from-templates.dto';
import { UpdateApprovalFlowStepFromTemplateDto } from './dto/update-approval-flow-step-from-template.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('approval-flow-steps')
export class ApprovalFlowStepController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Post('flow/:flowId/from-template')
  @Permissions('approval-flow-step:create')
  createFromTemplate(
    @Param('flowId', ParseIntPipe) flowId: number,
    @Body() dto: CreateApprovalFlowStepFromTemplateDto,
  ) {
    return this.requestConfigService.createApprovalFlowStepFromTemplate(
      flowId,
      dto,
    );
  }

  @Post('flow/:flowId/from-templates')
  @Permissions('approval-flow-step:create')
  createFromTemplates(
    @Param('flowId', ParseIntPipe) flowId: number,
    @Body() dto: CreateApprovalFlowStepsFromTemplatesDto,
  ) {
    return this.requestConfigService.createApprovalFlowStepsFromTemplates(
      flowId,
      dto,
    );
  }

  @Get('flow/:flowId')
  @Permissions('approval-flow-step:read')
  findByFlow(@Param('flowId', ParseIntPipe) flowId: number) {
    return this.requestConfigService.findStepsByFlow(flowId);
  }

  @Get(':id')
  @Permissions('approval-flow-step:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneApprovalFlowStep(id);
  }

  @Patch(':id/from-template')
  @Permissions('approval-flow-step:update')
  updateFromTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApprovalFlowStepFromTemplateDto,
  ) {
    return this.requestConfigService.updateApprovalFlowStepFromTemplate(
      id,
      dto,
    );
  }

  @Delete(':id')
  @Permissions('approval-flow-step:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeApprovalFlowStep(id);
  }
}
