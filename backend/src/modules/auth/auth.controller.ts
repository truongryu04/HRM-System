import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import LoginDto from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtUser } from './jwt-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@CurrentUser() currentUser: JwtUser) {
    const { permissions, ...user } = currentUser;

    return {
      statusCode: HttpStatus.OK,
      message: 'Get current user successfully',
      data: {
        user,
        permissions,
      },
    };
  }

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
      message: 'Login successfully',
      data: {
        user,
        permissions: permissions,
        access_token: access_token,
        refresh_token: refresh_token,
      },
    };
  }

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('activate-account')
  activateAccount(@Body() dto: ResetPasswordDto) {
    return this.authService.activateAccount(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
