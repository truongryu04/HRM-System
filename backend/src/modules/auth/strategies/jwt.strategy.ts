import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserService } from '../../user/user.service';
export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const roles = user.roles?.map((role) => role.name) ?? [];

    const permissions = [
      ...new Set(
        user.roles?.flatMap(
          (role) =>
            role.permissions?.map((permission) => permission.code) ?? [],
        ) ?? [],
      ),
    ];

    return {
      id: user.id,
      email: user.email,
      roles,
      permissions,
    };
  }
}
