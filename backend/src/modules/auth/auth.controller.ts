import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginData: LoginDto) {
    const {
      user,
      access_token: access_token,
      refresh_token: refresh_token,
      permissions: permissions,
    } = await this.authService.login(loginData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công',
      data: {
        user,
        permissions: permissions,
        access_token: access_token,
        refresh_token: refresh_token,
      },
    };
  }
}
