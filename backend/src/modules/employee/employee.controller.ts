import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-status.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Post()
  create(
    @Body()
    dto: CreateEmployeeDto,
  ) {
    return this.employeeService.create(dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.employeeService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get('me/profile')
  @UseGuards(AuthGuard('jwt'))
  getMyProfile(@CurrentUser('employeeId') employeeId: number | undefined) {
    return this.employeeService.findMyProfile(employeeId);
  }

  @Patch('me/profile')
  @UseGuards(AuthGuard('jwt'))
  updateMyProfile(
    @CurrentUser('employeeId') employeeId: number | undefined,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.employeeService.updateMyProfile(employeeId, dto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeeService.remove(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateEmployeeStatusDto,
  ) {
    return this.employeeService.updateStatus(id, dto.status);
  }
}
