import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateQuoteDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
