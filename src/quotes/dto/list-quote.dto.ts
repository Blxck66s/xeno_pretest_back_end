import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Users } from 'src/users/entities/user.entity';
import { Quote } from '../entities/quote.entity';

export class FilterQuoteDto {
  @IsOptional()
  @IsUUID('4')
  id?: Quote['id'];
  @IsOptional()
  @IsUUID('4')
  userId?: Users['id'];
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value && value.trim())
  text?: Quote['text'];
  @IsOptional()
  @Transform(({ value }: { value: string }) => value && +value)
  @IsNumber()
  minVotes?: number;
  @IsOptional()
  @Transform(({ value }: { value: string }) => value && +value)
  @IsNumber()
  maxVotes?: number;
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;
  @IsOptional()
  @IsDateString()
  dateTo?: Date;
}

export class PaginationQuoteDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => +value)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => +value)
  @Min(1)
  @Max(50)
  limit: number = 10;
}

export class SortQuoteDto {
  @IsOptional()
  @IsString()
  @IsEnum(['id', 'voteCount', 'text', 'createdAt'])
  sortField: 'id' | 'voteCount' | 'text' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortDirection: 'asc' | 'desc' = 'asc';
}
