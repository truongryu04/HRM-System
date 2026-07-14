import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomBytes } from 'node:crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { UserToken, UserTokenType } from './user-token.entity';

@Injectable()
export class UserTokenService {
  constructor(
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
    private readonly configService: ConfigService,
  ) {}

  private generateRawToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashToken(token: string): string {
    const secret = this.configService.getOrThrow<string>('USER_TOKEN_SECRET');

    return createHmac('sha256', secret).update(token).digest('hex');
  }

  async createToken(params: {
    user: User;
    type: UserTokenType;
    expiresInMinutes: number;
  }): Promise<string> {
    await this.userTokenRepository.update(
      {
        user: { id: params.user.id },
        type: params.type,
        usedAt: IsNull(),
      },
      { usedAt: new Date() },
    );

    const token = this.generateRawToken();
    const tokenHash = this.hashToken(token);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + params.expiresInMinutes * 60 * 1000,
    );

    const userToken = this.userTokenRepository.create({
      user: params.user,
      type: params.type,
      tokenHash,
      expiresAt,
      usedAt: null,
      failedAttempts: 0,
      lastSentAt: now,
    });

    await this.userTokenRepository.save(userToken);

    return token;
  }

  async findValidToken(params: {
    type: UserTokenType;
    token: string;
  }): Promise<UserToken | null> {
    const tokenHash = this.hashToken(params.token);

    return this.userTokenRepository.findOne({
      where: {
        tokenHash,
        type: params.type,
        expiresAt: MoreThan(new Date()),
        usedAt: IsNull(),
      },
      relations: { user: true },
    });
  }

  async markAsUsed(token: UserToken): Promise<void> {
    token.usedAt = new Date();
    await this.userTokenRepository.save(token);
  }
}
