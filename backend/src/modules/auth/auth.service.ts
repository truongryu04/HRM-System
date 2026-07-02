import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UserService } from '../user/user.service';
import LoginDto from './dto/login.dto';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { ChangePasswordDto } from './dto/change-password.dto';
import { comparePassword, hashPassword } from 'src/common/utils/bcrypt.util';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}
  async login(loginData: LoginDto) {
    const user = await this.userService.validateUser(
      loginData.email,
      loginData.password,
    );

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
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
    user.password = hashedPassword;
    await this.userService.update(userId, { password: user.password });
    await this.refreshTokenRepository.delete({
      user_id: userId,
    });
    return {
      message: 'Password changed successfully',
    };
  }
}
