import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Employee } from '../employee/employee.entity';
import { User } from '../user/user.entity';
import { LeaveType } from './leave-type.entity';
import { LeaveStatus } from './leave-status.enum';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, {
    eager: false,
  })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => LeaveType, {
    eager: false,
  })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column({
    type: 'date',
  })
  startDate!: Date;

  @Column({
    type: 'date',
  })
  endDate!: Date;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
  })
  totalDays!: number;

  @Column({
    type: 'text',
  })
  reason!: string;

  @Column({
    nullable: true,
  })
  attachment?: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status!: LeaveStatus;

  @ManyToOne(() => User, {
    nullable: true,
  })
  @JoinColumn({ name: 'approved_by' })
  approvedBy?: User;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  approvedAt?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  rejectReason?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  approvalNote?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
