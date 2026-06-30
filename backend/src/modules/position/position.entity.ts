import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  code!: string;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    nullable: true,
  })
  description!: string;

  @Column({
    default: true,
  })
  is_active!: boolean;
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
  //   @OneToMany(() => Employee, (employee) => employee.position)
  //   employees!: Employee[];
}
