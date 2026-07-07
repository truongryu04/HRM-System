import { Body, Controller, Post } from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequestService } from './leave-request.service';

@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  create(
    @Body()
    dto: CreateLeaveRequestDto,
  ) {
    return this.leaveRequestService.create(dto);
  }
}
