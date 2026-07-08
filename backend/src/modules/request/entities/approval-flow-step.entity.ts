import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { ApprovalFlow } from './approval-flow.entity';
import { ApproverType } from '../enums/approver-type.enum';

@Entity('approval_flow_steps')
export class ApprovalFlowStep {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ApprovalFlow)
  @JoinColumn({ name: 'flow_id' })
  flow!: ApprovalFlow;

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
  permissionCode?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'specific_user_id' })
  specificUser?: User;

  @Column({ type: 'jsonb', nullable: true })
  condition?: Record<string, unknown>;
}
