import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Request } from './request.entity';

@Entity('request_histories')
export class RequestHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Request)
  @JoinColumn({ name: 'request_id' })
  request!: Request;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  actor!: User;

  @Column()
  action!: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
