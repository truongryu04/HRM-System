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
import { CreateApprovalStepTemplateDto } from './dto/create-approval-step-template.dto';
import { UpdateApprovalStepTemplateDto } from './dto/update-approval-step-template.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard)
@Controller('approval-step-templates')
export class ApprovalStepTemplateController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Post()
  create(@Body() dto: CreateApprovalStepTemplateDto) {
    return this.requestConfigService.createApprovalStepTemplate(dto);
  }

  @Get()
  findAll() {
    return this.requestConfigService.findAllApprovalStepTemplates();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneApprovalStepTemplate(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApprovalStepTemplateDto,
  ) {
    return this.requestConfigService.updateApprovalStepTemplate(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeApprovalStepTemplate(id);
  }
}
