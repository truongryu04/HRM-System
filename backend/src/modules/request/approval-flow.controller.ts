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
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';
import { RequestConfigService } from './request-config.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('approval-flows')
export class ApprovalFlowController {
  constructor(private readonly requestConfigService: RequestConfigService) {}

  @Post()
  @Permissions('approval-flow:create')
  create(@Body() dto: CreateApprovalFlowDto) {
    return this.requestConfigService.createApprovalFlow(dto);
  }

  @Get()
  @Permissions('approval-flow:read')
  findAll(@Query('requestTypeId') requestTypeId?: string) {
    return this.requestConfigService.findAllApprovalFlows(
      requestTypeId ? Number(requestTypeId) : undefined,
    );
  }

  @Get(':id')
  @Permissions('approval-flow:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.findOneApprovalFlow(id);
  }

  @Patch(':id')
  @Permissions('approval-flow:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApprovalFlowDto,
  ) {
    return this.requestConfigService.updateApprovalFlow(id, dto);
  }

  @Delete(':id')
  @Permissions('approval-flow:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfigService.removeApprovalFlow(id);
  }
}
