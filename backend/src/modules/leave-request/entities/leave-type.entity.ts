import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveTypeCode } from '../enums/leave-type-code.enum';

@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: LeaveTypeCode,
    unique: true,
    nullable: true,
  })
  code!: LeaveTypeCode | null;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isPaid!: boolean;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
  })
  annualQuota!: number;

  @Column({ default: true })
  deductFromBalance!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
