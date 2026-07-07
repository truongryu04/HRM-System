import { Module } from '@nestjs/common';

import { LeaveTypeService } from './leave-type.service';
import { LeaveType } from './leave-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { LeaveTypeController } from './leave-type.controller';

@Module({
  controllers: [LeaveTypeController],
  providers: [LeaveTypeService],
  exports: [LeaveTypeService],
  imports: [TypeOrmModule.forFeature([LeaveType])],
})
export class LeaveModule {}
