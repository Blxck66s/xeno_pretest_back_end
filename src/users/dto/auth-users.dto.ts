import { IsString, Length } from 'class-validator';

export class AuthUsersDto {
  @IsString()
  @Length(4, 40)
  username: string;
  @IsString()
  @Length(6, 40)
  password: string;
}
