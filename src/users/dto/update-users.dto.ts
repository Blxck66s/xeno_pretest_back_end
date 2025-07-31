import { PartialType } from '@nestjs/mapped-types';
import { AuthUsersDto } from './auth-users.dto';

export class UpdateUsersDto extends PartialType(AuthUsersDto) {}
