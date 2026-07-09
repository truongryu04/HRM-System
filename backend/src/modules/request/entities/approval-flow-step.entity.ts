import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { ApprovalFlow } from './approval-flow.entity';
import { ApproverType } from '../enums/approver-type.enum';
import { ApprovalStepTemplate } from './approval-step-template.entity';

@Entity('approval_flow_steps')
export class ApprovalFlowStep {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ApprovalFlow)
  @JoinColumn({ name: 'flow_id' })
  flow!: ApprovalFlow;

  @ManyToOne(() => ApprovalStepTemplate, { nullable: true })
  @JoinColumn({ name: 'approval_step_template_id' })
  approvalStepTemplate?: ApprovalStepTemplate;

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

  @Column({ type: 'jsonb', nullable: true })
  condition?: Record<string, unknown>;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
