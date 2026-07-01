import { IsString } from 'class-validator';
import { EmployeeStatus } from '../employee.entity';

export class UpdateEmployeeStatusDto {
  @IsString()
  status!: EmployeeStatus;
}
