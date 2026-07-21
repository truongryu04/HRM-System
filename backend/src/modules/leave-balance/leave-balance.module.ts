import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/employee.entity';
import { LeaveType } from '../leave-request/entities/leave-type.entity';
import { Request } from '../request/entities/request.entity';
import { User } from '../user/user.entity';
import { LeaveBalanceTransaction } from './entities/leave-balance-transaction.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveBalance,
      LeaveBalanceTransaction,
      Employee,
      LeaveType,
      Request,
      User,
    ]),
  ],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
  exports: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
