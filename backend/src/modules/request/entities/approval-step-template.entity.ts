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
import { ApproverType } from '../enums/approver-type.enum';

@Entity('approval_step_templates')
export class ApprovalStepTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
