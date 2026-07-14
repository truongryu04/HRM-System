import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { comparePassword, hashPassword } from 'src/common/utils/bcrypt.util';
import { UserTokenType } from '../user-token/user-token.entity';
import { UserTokenService } from '../user-token/user-token.service';
import { UserService } from '../user/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import LoginDto from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userTokenService: UserTokenService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(loginData: LoginDto) {
    const user = await this.userService.validateUser(
      loginData.email,
      loginData.password,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.lastLoginAt = new Date();
    const permissions = [
      ...new Set(
        user.roles.flatMap((role) =>
          role.permissions.map((permission) => permission.code),
        ),
      ),
    ];
    const payload = {
      sub: user.id,
      email: user.email,
      employeeId: user.employee?.id,
      roles: user.roles.map((role) => role.name),
      permissions,
    };
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.refreshTokenRepository.save({
      user_id: user.id,
      token: refresh_token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employee?.id,
        roles: user.roles.map((role) => role.name),
      },
      permissions: permissions,
      access_token: this.jwtService.sign(payload),
      refresh_token: refresh_token,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepository.delete({
      token: refreshToken,
    });

    return {
      message: 'Logout success',
    };
  }

  private async deleteUserRefreshTokens(userId: number) {
    await this.refreshTokenRepository.delete({
      user_id: userId,
    });
  }

  async deleteExpiredRefreshTokens() {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at <= :now', { now: new Date() })
      .execute();
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Confirm password does not match');
    }

    const isMatch = await comparePassword(dto.currentPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(dto.newPassword);
    await this.userService.updatePassword(userId, hashedPassword);
    await this.deleteUserRefreshTokens(userId);

    return {
      message: 'Password changed successfully',
    };
  }
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (user) {
      await this.userService.sendPasswordResetEmail(user);
    }

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async activateAccount(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Confirm password does not match');
    }

    const userToken = await this.userTokenService.findValidToken({
      token: dto.token,
      type: UserTokenType.ACTIVATE_ACCOUNT,
    });

    if (!userToken) {
      throw new BadRequestException('Activation link is invalid or expired');
    }

    await this.userService.activateUser(userToken.user.id, dto.newPassword);
    await this.userTokenService.markAsUsed(userToken);

    return {
      message: 'Account activated successfully',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Confirm password does not match');
    }

    const userToken = await this.userTokenService.findValidToken({
      token: dto.token,
      type: UserTokenType.RESET_PASSWORD,
    });

    if (!userToken) {
      throw new BadRequestException(
        'Password reset link is invalid or expired',
      );
    }

    const hashedPassword = await hashPassword(dto.newPassword);
    await this.userService.updatePassword(userToken.user.id, hashedPassword);
    await this.userTokenService.markAsUsed(userToken);
    await this.deleteUserRefreshTokens(userToken.user.id);

    return {
      message: 'Password reset successfully',
    };
  }
}
