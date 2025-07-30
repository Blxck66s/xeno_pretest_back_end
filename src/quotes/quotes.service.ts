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
  create(createQuoteDto: CreateQuoteDto) {
    const quote = this.quotesRepository.create(createQuoteDto);
    return this.quotesRepository.save(quote);
  }

  findAll() {
    return this.quotesRepository.find();
  }

  findOne(id: Quote['id']) {
    return this.quotesRepository.findOne({ where: { id } });
  }

  update(id: Quote['id'], updateQuoteDto: UpdateQuoteDto) {
    return this.quotesRepository.update(id, updateQuoteDto);
  }

  remove(id: Quote['id']) {
    return this.quotesRepository.delete(id);
  }
}
