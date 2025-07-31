import { Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
  ) {}

  async create(createQuoteDto: CreateQuoteDto) {
    const quote = this.quotesRepository.create(createQuoteDto);
    return await this.quotesRepository.save(quote);
  }

  async findAll() {
    return await this.quotesRepository.find();
  }

  async findOne(id: Quote['id']) {
    return await this.quotesRepository.findOne({ where: { id } });
  }

  async update(id: Quote['id'], updateQuoteDto: UpdateQuoteDto) {
    return await this.quotesRepository.update(id, updateQuoteDto);
  }

  async remove(id: Quote['id']) {
    return await this.quotesRepository.delete(id);
  }
}
