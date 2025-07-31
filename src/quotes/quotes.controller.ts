import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { User, UserPayload } from '../users/decorator/user.decorator';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './entities/quote.entity';
import {
  FilterQuoteDto,
  SortQuoteDto,
  PaginationQuoteDto,
} from './dto/list-quote.dto';
import { Public } from '../auth/decorator/public.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Public()
  @Get('list')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() filterQuoteDto: FilterQuoteDto,
    @Query() sortQuoteDto: SortQuoteDto,
    @Query() paginationQuoteDto: PaginationQuoteDto,
  ) {
    return await this.quotesService.findAll(
      filterQuoteDto,
      sortQuoteDto,
      paginationQuoteDto,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @User() user: UserPayload,
    @Body() createQuoteDto: CreateQuoteDto,
  ) {
    createQuoteDto.userId = user.id;
    return await this.quotesService.create(createQuoteDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: Quote['id'],
    @User('id') user: UserPayload,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    updateQuoteDto.userId = user.id;
    return await this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: Quote['id'], @User('id') user: UserPayload) {
    return await this.quotesService.remove(id, user.id);
  }
}
