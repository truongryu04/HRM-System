import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column({ unique: true })
  token!: string;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;
}
