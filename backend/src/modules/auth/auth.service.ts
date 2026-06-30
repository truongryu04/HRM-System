import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UserService } from '../user/user.service';
import LoginDto from './dto/login.dto';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';

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
}
