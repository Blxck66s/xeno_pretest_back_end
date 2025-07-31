import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUsersDto } from '../users/dto/auth-users.dto';
import { Public } from './decorator/public.decorator';
import { AUTH_ERRORS } from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() authUsersDto: AuthUsersDto) {
    const user = await this.authService.validateUser(
      authUsersDto.username,
      authUsersDto.password,
    );
    if (!user) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    return this.authService.login(user);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() authUsersDto: AuthUsersDto) {
    const user = await this.authService.register(authUsersDto);
    return this.authService.login(user);
  }
}
