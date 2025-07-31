import { OmitType } from '@nestjs/mapped-types';
import { Users } from '../entities/user.entity';
//get the user entity without the password field and relations

export class UserWithoutPasswordDto extends OmitType(Users, [
  'password',
  'quotes',
  'vote',
] as const) {}
