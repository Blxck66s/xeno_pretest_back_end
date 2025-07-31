import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}
  async createOrUpdate(createVoteDto: CreateVoteDto) {
    const patchVote = await this.votesRepository
      .createQueryBuilder()
      .insert()
      .into(Vote)
      .values({
        user: { id: createVoteDto.userId },
        quote: { id: createVoteDto.quoteId },
      })
      .orUpdate(['quote_id'])
      .execute();

    if (!patchVote)
      throw new BadRequestException('Vote could not be created or updated');

    const rawResult = patchVote.raw as { affectedRows: number };

    const isInsert = rawResult.affectedRows === 1;
    const isUpdate = rawResult.affectedRows === 2;

    if (isInsert || isUpdate) {
      return await this.votesRepository.findOne({
        where: {
          user: { id: createVoteDto.userId },
          quote: { id: createVoteDto.quoteId },
        },
        relations: ['user', 'quote'],
      });
    } else
      throw new BadRequestException('Vote could not be created or updated');
  }

  async deleteVote(userId: string) {
    const existingVote = await this.votesRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!existingVote) throw new BadRequestException('Vote not found');
    await this.votesRepository.delete(existingVote.id);
    return { message: 'Vote deleted successfully' };
  }
}
