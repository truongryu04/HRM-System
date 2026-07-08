import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateApprovalFlowStepDto } from './dto/update-approval-flow-step.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard)
@Controller('approval-flow-steps')
export class ApprovalFlowStepController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneApprovalFlowStep(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApprovalFlowStepDto,
  ) {
    return this.requestConfigService.updateApprovalFlowStep(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeApprovalFlowStep(id);
  }
}
