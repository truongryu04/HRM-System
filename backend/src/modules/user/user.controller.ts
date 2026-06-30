import { UserService } from './user.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return {
      statusCode: 201,
      message: 'Tạo người dùng thành công',
      data: await this.userService.createUser(body),
    };
  }
  @Get()
  findAll(@Query() query: GetUsersDto) {
    return this.userService.findAll(query);
  }
}
