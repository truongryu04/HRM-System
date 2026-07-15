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
import { CreateApprovalStepTemplateDto } from './dto/create-approval-step-template.dto';
import { UpdateApprovalStepTemplateDto } from './dto/update-approval-step-template.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('approval-step-templates')
export class ApprovalStepTemplateController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Post()
  @Permissions('approval-step-template:create')
  create(@Body() dto: CreateApprovalStepTemplateDto) {
    return this.requestConfigService.createApprovalStepTemplate(dto);
  }

  @Get()
  @Permissions('approval-step-template:read')
  findAll() {
    return this.requestConfigService.findAllApprovalStepTemplates();
  }

  @Get(':id')
  @Permissions('approval-step-template:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneApprovalStepTemplate(id);
  }

  @Patch(':id')
  @Permissions('approval-step-template:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApprovalStepTemplateDto,
  ) {
    return this.requestConfigService.updateApprovalStepTemplate(id, dto);
  }

  @Delete(':id')
  @Permissions('approval-step-template:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeApprovalStepTemplate(id);
  }
}
