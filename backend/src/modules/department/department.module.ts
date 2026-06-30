import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department } from './department.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
  imports: [TypeOrmModule.forFeature([Department])],
})
export class DepartmentModule {}
