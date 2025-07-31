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
  userId?: Users['id'];
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value && value.trim())
  text?: Quote['text'];
  @IsOptional()
  @IsNumber()
  minVotes?: number;
  @IsOptional()
  @IsNumber()
  maxVotes?: number;
  @IsOptional()
  @IsDateString()
  startDate?: Date;
  @IsOptional()
  @IsDateString()
  endDate?: Date;
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
  @IsEnum(['id', 'text', 'createdAt'])
  sortField: 'id' | 'text' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'asc';
}
