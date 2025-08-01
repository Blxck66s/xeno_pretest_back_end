import { Controller, Get } from '@nestjs/common';
import { User, UserPayload } from './decorator/user.decorator';
import { UsersService } from './users.service';
import { Users } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@User() user: UserPayload): Promise<Users | null> {
    return await this.usersService.getProfile(user.id);
  }
}
