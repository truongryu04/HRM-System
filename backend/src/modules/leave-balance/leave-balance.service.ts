import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import type { JwtUser } from '../auth/jwt-user.interface';
import { Employee, EmployeeStatus } from '../employee/employee.entity';
import { LeaveType } from '../leave-request/entities/leave-type.entity';
import { Request } from '../request/entities/request.entity';
import { User } from '../user/user.entity';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';
import { GrantDefaultLeaveBalanceDto } from './dto/grant-default-leave-balance.dto';
import { LeaveBalanceQueryDto } from './dto/leave-balance-query.dto';
import { LeaveBalanceStatusQueryDto } from './dto/leave-balance-status-query.dto';
import { LeaveBalanceTransaction } from './entities/leave-balance-transaction.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveBalanceTransactionType } from './enums/leave-balance-transaction-type.enum';

@Injectable()
export class LeaveBalanceService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(LeaveBalance)
    private readonly balanceRepository: Repository<LeaveBalance>,
    @InjectRepository(LeaveBalanceTransaction)
    private readonly transactionRepository: Repository<LeaveBalanceTransaction>,
  ) {}

  async grantDefault(dto: GrantDefaultLeaveBalanceDto, user: JwtUser) {
    this.validateHalfDayIncrement(dto.annualGranted, 'Quota năm');

    return this.dataSource.transaction(async (manager) => {
      const leaveType = await manager.findOne(LeaveType, {
        where: { id: dto.leaveTypeId, isDeleted: false, isActive: true },
      });
      if (!leaveType) {
        throw new NotFoundException('Không tìm thấy loại nghỉ phép');
      }
      if (!leaveType.deductFromBalance) {
        throw new BadRequestException('Loại nghỉ này không áp dụng số dư phép');
      }

      const employees = await manager.find(Employee, {
        where: {
          id: In(dto.employeeIds),
          isDeleted: false,
          status: In([
            EmployeeStatus.ACTIVE,
            EmployeeStatus.INACTIVE,
            EmployeeStatus.ON_LEAVE,
          ]),
        },
        order: { id: 'ASC' },
      });

      const result = {
        requestedEmployees: dto.employeeIds.length,
        totalEmployees: employees.length,
        created: 0,
        updated: 0,
        unchanged: 0,
        skipped: 0,
      };

      for (const employee of employees) {
        let balance = await manager.findOne(LeaveBalance, {
          where: {
            employee: { id: employee.id },
            leaveType: { id: leaveType.id },
            year: dto.year,
          },
          lock: { mode: 'pessimistic_write' },
        });

        const isNew = !balance;
        const previousGranted = Number(balance?.annualGranted ?? 0);
        if (!balance) {
          balance = manager.create(LeaveBalance, {
            employee,
            leaveType,
            year: dto.year,
          });
        }

        const delta = dto.annualGranted - previousGranted;
        if (!isNew && this.getRemaining(balance) + delta < 0) {
          result.skipped += 1;
          continue;
        }

        if (!isNew && delta === 0) {
          result.unchanged += 1;
          continue;
        }

        balance.annualGranted = dto.annualGranted;
        const saved = await manager.save(LeaveBalance, balance);

        if (delta !== 0) {
          await manager.save(
            LeaveBalanceTransaction,
            manager.create(LeaveBalanceTransaction, {
              balance: saved,
              type: isNew
                ? LeaveBalanceTransactionType.GRANT
                : LeaveBalanceTransactionType.ADJUSTMENT,
              amount: delta,
              createdBy: { id: user.id } as User,
              note:
                dto.note?.trim() || `Đặt quota phép mặc định năm ${dto.year}`,
            }),
          );
        }

        if (isNew) {
          result.created += 1;
        } else {
          result.updated += 1;
        }
      }

      return result;
    });
  }

  async adjust(id: number, dto: AdjustLeaveBalanceDto, user: JwtUser) {
    this.validateHalfDayIncrement(dto.amount, 'Mức điều chỉnh');

    return this.dataSource.transaction(async (manager) => {
      const balance = await manager.findOne(LeaveBalance, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!balance) {
        throw new NotFoundException('Không tìm thấy số dư phép');
      }

      const nextAdjustment = Number(balance.adjustment) + dto.amount;
      if (this.getRemaining(balance) + dto.amount < 0) {
        throw new BadRequestException('Điều chỉnh làm số dư phép bị âm');
      }
      balance.adjustment = nextAdjustment;
      const saved = await manager.save(LeaveBalance, balance);

      await manager.save(
        LeaveBalanceTransaction,
        manager.create(LeaveBalanceTransaction, {
          balance: saved,
          type: LeaveBalanceTransactionType.ADJUSTMENT,
          amount: dto.amount,
          createdBy: { id: user.id } as User,
          note: dto.reason,
        }),
      );

      return this.toResponse(
        await manager.findOneOrFail(LeaveBalance, {
          where: { id: saved.id },
          relations: { employee: true, leaveType: true },
        }),
      );
    });
  }

  async findMy(user: JwtUser, query: LeaveBalanceQueryDto) {
    return this.findByEmployee(user.employeeId, query);
  }

  async findByEmployee(employeeId: number, query: LeaveBalanceQueryDto) {
    const balances = await this.balanceRepository.find({
      where: {
        employee: { id: employeeId },
        ...(query.year ? { year: query.year } : {}),
        ...(query.leaveTypeId ? { leaveType: { id: query.leaveTypeId } } : {}),
      },
      relations: { employee: true, leaveType: true },
      order: { year: 'DESC', createdAt: 'DESC' },
    });

    return balances.map((balance) => this.toResponse(balance));
  }

  async findMyHistory(user: JwtUser, query: LeaveBalanceQueryDto) {
    return this.findHistory(user.employeeId, query);
  }

  async findGrantedEmployeeIds(query: LeaveBalanceStatusQueryDto) {
    const balances = await this.balanceRepository.find({
      where: {
        year: query.year,
        leaveType: { id: query.leaveTypeId },
        employee: { isDeleted: false },
      },
      relations: { employee: true },
    });

    return balances.map((balance) => balance.employee.id);
  }

  async findHistory(employeeId: number, query: LeaveBalanceQueryDto) {
    return this.transactionRepository.find({
      where: {
        balance: {
          employee: { id: employeeId },
          ...(query.year ? { year: query.year } : {}),
          ...(query.leaveTypeId
            ? { leaveType: { id: query.leaveTypeId } }
            : {}),
        },
      },
      relations: {
        balance: { employee: true, leaveType: true },
        request: true,
        createdBy: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async deductAvailable(
    employeeId: number,
    leaveTypeId: number,
    year: number,
    requestedAmount: number,
    request: Request,
    manager: EntityManager,
  ): Promise<number> {
    const referenceKey = `DEDUCT:${request.id}:${year}`;
    const existing = await manager.findOne(LeaveBalanceTransaction, {
      where: { referenceKey },
    });
    if (existing) {
      return Math.abs(Number(existing.amount));
    }

    const balance = await manager.findOne(LeaveBalance, {
      where: {
        employee: { id: employeeId },
        leaveType: { id: leaveTypeId },
        year,
      },
      lock: { mode: 'pessimistic_write' },
    });
    if (!balance) {
      return 0;
    }

    const deducted = Math.min(
      requestedAmount,
      Math.max(0, this.getRemaining(balance)),
    );
    if (deducted <= 0) {
      return 0;
    }

    const carryOverAvailable = Math.max(
      0,
      Number(balance.carryOverGranted) -
        Number(balance.carryOverUsed) -
        Number(balance.carryOverExpired),
    );
    const fromCarryOver = Math.min(carryOverAvailable, deducted);
    const fromAnnual = deducted - fromCarryOver;

    balance.carryOverUsed = Number(balance.carryOverUsed) + fromCarryOver;
    balance.annualUsed = Number(balance.annualUsed) + fromAnnual;
    const saved = await manager.save(LeaveBalance, balance);

    await manager.save(
      LeaveBalanceTransaction,
      manager.create(LeaveBalanceTransaction, {
        balance: saved,
        type: LeaveBalanceTransactionType.DEDUCT,
        amount: -deducted,
        request,
        referenceKey,
        note: `Trừ phép cho yêu cầu ${request.code}`,
        metadata: { fromCarryOver, fromAnnual },
      }),
    );

    return deducted;
  }

  private getRemaining(balance: LeaveBalance): number {
    return (
      Number(balance.annualGranted) +
      Number(balance.carryOverGranted) +
      Number(balance.adjustment) -
      Number(balance.annualUsed) -
      Number(balance.carryOverUsed) -
      Number(balance.carryOverExpired)
    );
  }

  private validateHalfDayIncrement(value: number, fieldName: string): void {
    if (!Number.isFinite(value) || !Number.isInteger(value * 2)) {
      throw new BadRequestException(
        `${fieldName} phải tăng theo bước 0,5 ngày`,
      );
    }
  }

  private toResponse(balance: LeaveBalance) {
    return {
      ...balance,
      annualGranted: Number(balance.annualGranted),
      carryOverGranted: Number(balance.carryOverGranted),
      adjustment: Number(balance.adjustment),
      annualUsed: Number(balance.annualUsed),
      carryOverUsed: Number(balance.carryOverUsed),
      carryOverExpired: Number(balance.carryOverExpired),
      remaining: this.getRemaining(balance),
    };
  }
}
