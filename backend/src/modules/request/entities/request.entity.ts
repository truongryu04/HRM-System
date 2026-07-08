import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employee/employee.entity';
import { User } from '../../user/user.entity';
import { ApprovalFlow } from './approval-flow.entity';
import { RequestStatus } from '../enums/request-status.enum';
import { RequestType } from './request-type.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @ManyToOne(() => RequestType)
  @JoinColumn({ name: 'request_type_id' })
  requestType!: RequestType;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @Column()
  title!: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @Column({ default: 1 })
  currentStepOrder!: number;

  @ManyToOne(() => ApprovalFlow, { nullable: true })
  @JoinColumn({ name: 'approval_flow_id' })
  approvalFlow?: ApprovalFlow;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'final_approved_by' })
  finalApprovedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  finalApprovedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'rejected_by' })
  rejectedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
