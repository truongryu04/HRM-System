import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Department } from '../department/department.entity';
import { Position } from '../position/position.entity';
import { User } from '../user/user.entity';
import { WorkShift } from '../work-shifts/work-shifts.entity';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE', // Đang làm việc
  INACTIVE = 'INACTIVE', // Tạm nghỉ / khóa tài khoản
  ON_LEAVE = 'ON_LEAVE', // Nghỉ phép dài ngày
  RESIGNED = 'RESIGNED', // Đã nghỉ việc
  TERMINATED = 'TERMINATED', // Sa thải / chấm dứt hợp đồng
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  employeeCode!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  fullName!: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender!: Gender;

  @Column({
    type: 'date',
  })
  dob!: Date;

  @Column({
    nullable: true,
  })
  phone?: string;

  @Column({
    nullable: true,
  })
  address?: string;

  @Column({
    type: 'date',
  })
  joinDate!: Date;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status!: EmployeeStatus;

  @Column({
    nullable: true,
  })
  avatarUrl?: string;

  @ManyToOne(() => Department)
  @JoinColumn({
    name: 'department_id',
  })
  department!: Department;

  @ManyToOne(() => Position)
  @JoinColumn({
    name: 'position_id',
  })
  position!: Position;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    default: false,
  })
  isDeleted!: boolean;

  @OneToMany(() => User, (user) => user.employee)
  users!: User[];

  @ManyToOne(() => WorkShift)
  @JoinColumn({ name: 'work_shift_id' })
  workShift?: WorkShift;
}
