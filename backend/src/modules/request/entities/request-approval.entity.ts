import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { ApproverType } from '../enums/approver-type.enum';
import { Request } from './request.entity';
import { RequestApprovalStatus } from '../enums/request-approval-status.enum';

@Entity('request_approvals')
export class RequestApproval {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Request)
  @JoinColumn({ name: 'request_id' })
  request!: Request;

  @Column()
  stepOrder!: number;

  @Column()
  stepName!: string;

  @Column({
    type: 'enum',
    enum: ApproverType,
  })
  approverType!: ApproverType;

  @Column({ nullable: true })
  roleCode?: string;

  @Column({ nullable: true })
  positionCode?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'specific_user_id' })
  specificUser?: User;

  @Column({
    type: 'enum',
    enum: RequestApprovalStatus,
    default: RequestApprovalStatus.WAITING,
  })
  status!: RequestApprovalStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acted_by' })
  actedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  actedAt?: Date;

  @Column({ nullable: true })
  note?: string;
}
