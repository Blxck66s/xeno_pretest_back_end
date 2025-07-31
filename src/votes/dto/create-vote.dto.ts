import { IsNotEmpty, IsUUID } from 'class-validator';
import { Quote } from '../../quotes/entities/quote.entity';
import { Users } from '../../users/entities/user.entity';

export class CreateVoteDto {
  @IsNotEmpty()
  @IsUUID('4')
  quoteId: Quote['id'];

  userId: Users['id'];
}
