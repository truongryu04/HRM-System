import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Employee } from '../../employee/employee.entity';
import { LeaveType } from '../../leave-request/entities/leave-type.entity';

@Entity('leave_balances')
@Index(
  'UQ_leave_balance_employee_type_year',
  ['employee', 'leaveType', 'year'],
  { unique: true },
)
export class LeaveBalance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => LeaveType, { nullable: false })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column({ type: 'smallint' })
  year!: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  annualGranted!: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  carryOverGranted!: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  adjustment!: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  annualUsed!: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  carryOverUsed!: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  carryOverExpired!: number;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
