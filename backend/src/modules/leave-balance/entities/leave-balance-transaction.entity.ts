import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Request } from '../../request/entities/request.entity';
import { User } from '../../user/user.entity';
import { LeaveBalanceTransactionType } from '../enums/leave-balance-transaction-type.enum';
import { LeaveBalance } from './leave-balance.entity';

@Entity('leave_balance_transactions')
export class LeaveBalanceTransaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LeaveBalance, { nullable: false })
  @JoinColumn({ name: 'leave_balance_id' })
  balance!: LeaveBalance;

  @Column({
    type: 'enum',
    enum: LeaveBalanceTransactionType,
  })
  type!: LeaveBalanceTransactionType;

  @Column({ type: 'decimal', precision: 6, scale: 1 })
  amount!: number;

  @ManyToOne(() => Request, { nullable: true })
  @JoinColumn({ name: 'request_id' })
  request?: Request;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @Index({ unique: true })
  @Column({ nullable: true })
  referenceKey?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
