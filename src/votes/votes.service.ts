import { Injectable } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}
  create(createVoteDto: CreateVoteDto) {
    const vote = this.votesRepository.create(createVoteDto);
    return this.votesRepository.save(vote);
  }

  findAll() {
    return this.votesRepository.find();
  }

  findOne(id: Vote['id']) {
    return this.votesRepository.findOne({ where: { id } });
  }

  update(id: Vote['id'], updateVoteDto: UpdateVoteDto) {
    return this.votesRepository.update(id, updateVoteDto);
  }

  remove(id: Vote['id']) {
    return this.votesRepository.delete(id);
  }
}
