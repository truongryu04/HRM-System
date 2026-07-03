import {
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity,
  Unique,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';

@Entity('attendances')
@Unique(['employee', 'attendanceDate'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'date' })
  attendanceDate!: string;

  @Column({ type: 'timestamp', nullable: true })
  checkInTime!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime?: Date | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  workMinutes!: number;
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  workingDayValue?: number;
  @Column({
    type: 'int',
    nullable: true,
    default: 0,
  })
  lateMinutes!: number;
  @Column({ default: false })
  isLate!: boolean;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
  })
  earlyLeaveMinutes!: number;
  @Column({ default: false })
  isEarlyLeave!: boolean;
  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
