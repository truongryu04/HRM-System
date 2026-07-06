import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from './user-status.enum';
import { Role } from '../role/role.entity';
import { Employee } from '../employee/employee.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  email!: string;

  @Column({
    select: false,
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;
  @Column({ default: false })
  isDeleted?: boolean;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt!: Date;
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt?: Date;
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
  })
  roles!: Role[];

  @ManyToOne(() => Employee, (employee) => employee.users)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;
}
