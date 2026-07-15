import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permission.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestQueryDto } from './dto/request-query.dto';
import { RequestService } from './request.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  @Permissions('request:read-all')
  findAll(@Query() query: RequestQueryDto) {
    return this.requestService.findAll(query);
  }

  @Get('my')
  findMyRequests(@CurrentUser() user: JwtUser) {
    return this.requestService.findMyRequests(user);
  }

  @Get('pending-approval')
  @Permissions('request:read')
  findPendingApproval(@CurrentUser() user: JwtUser) {
    return this.requestService.findPendingApproval(user);
  }

  @Get('approval')
  @Permissions('request:read')
  findApprovalRequests(@CurrentUser() user: JwtUser) {
    return this.requestService.findApprovalRequests(user);
  }

  @Get(':id')
  @Permissions('request:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.findDetail(id);
  }

  @Get(':id/approvals')
  @Permissions('request:read')
  findApprovals(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.findApprovals(id);
  }

  @Get(':id/histories')
  @Permissions('request:read')
  findHistories(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.findHistories(id);
  }

  @Patch(':id/approve')
  @Permissions('request:approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveRequestDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.requestService.approve(id, user, dto);
  }

  @Patch(':id/reject')
  @Permissions('request:reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectRequestDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.requestService.reject(id, user, dto);
  }

  @Patch(':id/cancel')
  @Permissions('request:cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.requestService.cancel(id, user);
  }
}
