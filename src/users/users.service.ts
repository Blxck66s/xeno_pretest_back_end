import { Injectable } from '@nestjs/common';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async create(createUsersDto: CreateUsersDto): Promise<Users> {
    const user = this.usersRepository.create(createUsersDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<Users[]> {
    return this.usersRepository.find();
  }

  async findOne(id: Users['id']): Promise<Users | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: Users['id'], updateUsersDto: UpdateUsersDto): Promise<void> {
    await this.usersRepository.update(id, updateUsersDto);
  }

  async remove(id: Users['id']): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
