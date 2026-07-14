import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RoleModule } from '../role/role.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { RefreshToken } from './refresh-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UserTokenModule } from '../user-token/user-token.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UserModule,
    UserTokenModule,
    RoleModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
})
export class AuthModule {}
