import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserToken } from './user-token.entity';
import { UserTokenService } from './user-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserToken])],
  providers: [UserTokenService],
  exports: [UserTokenService],
})
export class UserTokenModule {}
