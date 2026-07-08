import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestType } from './request-type.entity';

@Entity('approval_flows')
export class ApprovalFlow {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => RequestType)
  @JoinColumn({ name: 'request_type_id' })
  requestType!: RequestType;

  @Column()
  name!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
