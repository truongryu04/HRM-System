import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({
    nullable: true,
  })
  description?: string;
  @Column({ unique: true })
  code!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 'ACTIVE' })
  status!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  isDeleted?: boolean;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: Employee;
}
