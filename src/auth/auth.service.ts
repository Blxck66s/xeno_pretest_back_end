import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserWithoutPasswordDto } from '../users/dto/user-without-password.dto';
import { AuthUsersDto } from '../users/dto/auth-users.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AUTH_ERRORS } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserWithoutPasswordDto | null> {
    const user = await this.usersService.findOne({ username });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  login(user: UserWithoutPasswordDto) {
    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(authUsersDto: AuthUsersDto): Promise<UserWithoutPasswordDto> {
    const existingUser = await this.usersService.findOne({
      username: authUsersDto.username,
    });
    if (existingUser)
      throw new ConflictException(AUTH_ERRORS.USER_ALREADY_EXISTS);

    const hashedPassword = await bcrypt.hash(authUsersDto.password, 10);
    return await this.usersService.create({
      ...authUsersDto,
      password: hashedPassword,
    });
  }
}
