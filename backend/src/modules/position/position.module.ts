import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { Position } from './position.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
  imports: [TypeOrmModule.forFeature([Position])],
})
export class PositionModule {}
