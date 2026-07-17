import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { Request } from '../../request/entities/request.entity';
import { LeaveType } from './leave-type.entity';
import { LeaveSession } from '../enums/leave-session.enum';

@Entity('leave_requests')
@Index('UQ_leave_requests_request_id', ['request'], { unique: true })
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Request)
  @JoinColumn({ name: 'request_id' })
  request!: Request;

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
    type: 'enum',
    enum: LeaveSession,
    default: LeaveSession.FULL,
  })
  session!: LeaveSession;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
