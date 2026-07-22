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

  @Column({ name: 'subtype_key', type: 'varchar', length: 100, nullable: true })
  subtypeKey!: string | null;

  @Column({
    name: 'subtype_label',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  subtypeLabel!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
