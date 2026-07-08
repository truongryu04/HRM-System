import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from '../../employee/employee.entity';
import { LeaveRequest } from './leave-request.entity';
import { LeaveSession } from '../enums/leave-session.enum';

@Entity('leave_request_days')
export class LeaveRequestDay {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LeaveRequest)
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest!: LeaveRequest;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'date' })
  date!: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
  })
  value!: number;

  @Column({
    type: 'enum',
    enum: LeaveSession,
    default: LeaveSession.FULL,
  })
  session!: LeaveSession;

  @Column({ default: true })
  isPaid!: boolean;

  @Column({ default: true })
  deductFromBalance!: boolean;
}
