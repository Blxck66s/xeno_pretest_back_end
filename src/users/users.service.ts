import { Injectable } from '@nestjs/common';
import { Users } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AuthUsersDto } from './dto/auth-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async create(authUsersDto: AuthUsersDto): Promise<Users> {
    const user = this.usersRepository.create(authUsersDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<Users[]> {
    return await this.usersRepository.find();
  }

  async findOneById(id: Users['id']): Promise<Users | null> {
    return await this.usersRepository.findOneBy({ id });
  }

  async findOne(field: FindOptionsWhere<Users>): Promise<Users | null> {
    return await this.usersRepository.findOneBy(field);
  }

  async update(id: Users['id'], updateUsersDto: UpdateUsersDto): Promise<void> {
    await this.usersRepository.update(id, updateUsersDto);
  }

  async remove(id: Users['id']): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
