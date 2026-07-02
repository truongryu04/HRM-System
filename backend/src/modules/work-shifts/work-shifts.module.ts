import { Module } from '@nestjs/common';
import { WorkShiftsController } from './work-shifts.controller';
import { WorkShiftsService } from './work-shifts.service';
import { WorkShift } from './work-shifts.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  controllers: [WorkShiftsController],
  providers: [WorkShiftsService],
  exports: [WorkShiftsService],
  imports: [TypeOrmModule.forFeature([WorkShift])],
})
export class WorkShiftsModule {}
