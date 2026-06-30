import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
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
}
