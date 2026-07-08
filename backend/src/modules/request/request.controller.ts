import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt-user.interface';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestService } from './request.service';

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  findAll() {
    return this.requestService.findAll();
  }

  @Get('my')
  findMyRequests(@CurrentUser() user: JwtUser) {
    return this.requestService.findMyRequests(user);
  }

  @Get('pending-approval')
  findPendingApproval(@CurrentUser() user: JwtUser) {
    return this.requestService.findPendingApproval(user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const request = await this.requestService.findOne(id);
    const approvals = await this.requestService.findApprovals(id);
    return { ...request, approvals };
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveRequestDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.requestService.approve(id, user, dto);
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectRequestDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.requestService.reject(id, user, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.requestService.cancel(id, user);
  }
}
