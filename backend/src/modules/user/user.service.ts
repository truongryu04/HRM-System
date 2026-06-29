import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { CreateUserDto } from './dto/create-user.dto';
import { comparePassword, hashPassword } from 'src/common/utils/bcrypt.util';
import { RoleService } from '../role/role.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    const isEmail = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (isEmail) {
      throw new ConflictException('Email đã tồn tại');
    }
    const roles = await this.roleService.findByIds(user.roleIds);
    const hashedPassword = await hashPassword(user.password);
    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
      roles,
    });
    return await this.userRepository.save(newUser);
  }
}
