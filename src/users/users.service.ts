import { Injectable } from '@nestjs/common';
import { Users } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AuthUsersDto } from './dto/auth-users.dto';
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

  async findOne(field: FindOptionsWhere<Users>): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: field,
      select: {
        id: true,
        username: true,
        password: true,
      },
    });
  }

  async getProfile(id: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        createdAt: true,
        vote: { id: true, createdAt: true, quote: { id: true } },
      },
      relations: ['vote', 'vote.quote'],
    });
  }
}
