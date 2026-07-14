import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum UserTokenType {
  ACTIVATE_ACCOUNT = 'activate_account',
  RESET_PASSWORD = 'reset_password',
}

@Entity('user_tokens')
@Index(['user', 'type'])
export class UserToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({
    type: 'enum',
    enum: UserTokenType,
  })
  type!: UserTokenType;

  @Column({ length: 64 })
  tokenHash!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  failedAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
