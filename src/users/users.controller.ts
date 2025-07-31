import { Controller, Get } from '@nestjs/common';
import { User, UserPayload } from './decorator/user.decorator';

@Controller('users')
export class UsersController {
  constructor() {}

  @Get('profile')
  getProfile(@User() user: UserPayload): UserPayload {
    return user;
  }
}
