import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { JwtUser } from '../auth/jwt-user.interface';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';
import { GrantDefaultLeaveBalanceDto } from './dto/grant-default-leave-balance.dto';
import { LeaveBalanceQueryDto } from './dto/leave-balance-query.dto';
import { LeaveBalanceStatusQueryDto } from './dto/leave-balance-status-query.dto';
import { LeaveBalanceService } from './leave-balance.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leave-balances')
export class LeaveBalanceController {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  @Post('grant-default')
  @Permissions('leave-balance:grant')
  grantDefault(
    @Body() dto: GrantDefaultLeaveBalanceDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.leaveBalanceService.grantDefault(dto, user);
  }

  @Patch(':id/adjust')
  @Permissions('leave-balance:adjust')
  adjust(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustLeaveBalanceDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.leaveBalanceService.adjust(id, dto, user);
  }

  @Get('my')
  findMy(@CurrentUser() user: JwtUser, @Query() query: LeaveBalanceQueryDto) {
    return this.leaveBalanceService.findMy(user, query);
  }

  @Get('my/history')
  findMyHistory(
    @CurrentUser() user: JwtUser,
    @Query() query: LeaveBalanceQueryDto,
  ) {
    return this.leaveBalanceService.findMyHistory(user, query);
  }

  @Get('granted-employee-ids')
  @Permissions('leave-balance:read')
  findGrantedEmployeeIds(@Query() query: LeaveBalanceStatusQueryDto) {
    return this.leaveBalanceService.findGrantedEmployeeIds(query);
  }

  @Get('employee/:employeeId')
  @Permissions('leave-balance:read')
  findByEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query() query: LeaveBalanceQueryDto,
  ) {
    return this.leaveBalanceService.findByEmployee(employeeId, query);
  }

  @Get('employee/:employeeId/history')
  @Permissions('leave-balance:read')
  findHistory(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query() query: LeaveBalanceQueryDto,
  ) {
    return this.leaveBalanceService.findHistory(employeeId, query);
  }
}
