import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { Repository } from 'typeorm';
import { Users } from '../users/entities/user.entity';
import {
  FilterQuoteDto,
  PaginationQuoteDto,
  SortQuoteDto,
} from './dto/list-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
  ) {}

  async create(createQuoteDto: CreateQuoteDto) {
    const user = await this.isUserExist(createQuoteDto.userId);

    const quote = this.quotesRepository.create({
      text: createQuoteDto.text,
      user,
    });
    return await this.quotesRepository.save(quote);
  }

  async findAll(
    filterQuoteDto: FilterQuoteDto,
    sortQuoteDto: SortQuoteDto,
    paginationQuoteDto?: PaginationQuoteDto,
  ) {
    const { userId, text, dateFrom, dateTo, minVotes, maxVotes } =
      filterQuoteDto;
    const { page, limit } = paginationQuoteDto || {};
    const { sortField, sortDirection } = sortQuoteDto;

    const query = this.quotesRepository
      .createQueryBuilder('quote')
      .select(['quote', 'user.id', 'user.username'])
      .leftJoin('quote.user', 'user');

    const needsVoteJoin = minVotes || maxVotes || sortField === 'voteCount';

    if (needsVoteJoin) {
      query.leftJoin('quote.votes', 'vote');
      query.groupBy('quote.id, user.id, user.username');
      query.addSelect('COUNT(vote.id)', 'voteCount');
    } else {
      query.loadRelationCountAndMap('quote.voteCount', 'quote.votes');
    }

    if (userId) query.andWhere('quote.user_id = :user_id', { user_id: userId });
    if (text) query.andWhere('quote.text LIKE :text', { text: `%${text}%` });

    if (dateFrom) {
      const startOfDay = new Date(dateFrom);
      startOfDay.setHours(0, 0, 0, 0);
      query.andWhere('quote.createdAt >= :dateFrom', {
        dateFrom: startOfDay,
      });
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      query.andWhere('quote.createdAt <= :dateTo', {
        dateTo: endOfDay,
      });
    }

    if (minVotes) query.having('COUNT(vote.id) >= :minVotes', { minVotes });
    if (maxVotes) query.having('COUNT(vote.id) <= :maxVotes', { maxVotes });

    if (sortField === 'voteCount' && needsVoteJoin) {
      query.orderBy('voteCount', sortDirection.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy(
        `quote.${sortField}`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (page && limit) query.skip((page - 1) * limit).take(limit);

    if (needsVoteJoin) {
      const data = await query.getRawAndEntities();

      const countQuery = this.quotesRepository
        .createQueryBuilder('quote')
        .leftJoin('quote.votes', 'vote')
        .groupBy('quote.id');

      if (userId)
        countQuery.andWhere('quote.user_id = :user_id', { user_id: userId });
      if (text)
        countQuery.andWhere('quote.text LIKE :text', { text: `%${text}%` });

      if (dateFrom) {
        const startOfDay = new Date(dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        countQuery.andWhere('quote.createdAt >= :dateFrom', {
          dateFrom: startOfDay,
        });
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        countQuery.andWhere('quote.createdAt <= :dateTo', { dateTo: endOfDay });
      }

      if (minVotes)
        countQuery.having('COUNT(vote.id) >= :minVotes', { minVotes });
      if (maxVotes)
        countQuery.having('COUNT(vote.id) <= :maxVotes', { maxVotes });

      const total = await countQuery.getCount();

      const mappedData = data.entities.map((quote, index) => ({
        ...quote,
        voteCount:
          +(data as { raw: { voteCount: number }[] }).raw[index].voteCount || 0,
      }));

      return { page, limit, total, data: mappedData };
    }

    const [data, total] = await query.getManyAndCount();
    return { page, limit, total, data };
  }

  async update(
    id: Quote['id'],
    updateQuoteDto: UpdateQuoteDto,
    userId: Users['id'],
  ) {
    const result = await this.quotesRepository.update(id, {
      ...updateQuoteDto,
      user: { id: userId },
    });
    if (result && result.affected === 1) {
      return await this.quotesRepository.findOne({ where: { id } });
    } else throw new BadRequestException(`Quote not found or update failed.`);
  }

  async remove(id: Quote['id'], userId: Users['id']) {
    const quote = await this.quotesRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!quote)
      throw new BadRequestException(
        `Quote not found or you don't have permission to delete it.`,
      );
    return await this.quotesRepository.delete(id);
  }

  async isUserExist(userId: string): Promise<Users> {
    const user = await this.quotesRepository.manager
      .findOneOrFail(Users, {
        where: { id: userId },
        select: ['id', 'username'],
      })
      .catch(() => {
        throw new BadRequestException('User not found.');
      });
    return user;
  }
}
