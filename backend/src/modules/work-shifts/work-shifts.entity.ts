import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('work_shifts')
export class WorkShift {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    type: 'time',
  })
  startTime!: string;

  @Column({
    type: 'time',
  })
  endTime!: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  breakStart!: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  breakEnd!: string;

  // Cho phép đi muộn đến 09:00 mới tính là muộn
  @Column({
    type: 'time',
  })
  lateAfter!: string;

  @Column({
    default: 480,
  })
  standardMinutes!: number;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @Column({
    default: false,
  })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
