import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { User, UserPayload } from '../users/decorator/user.decorator';

@Controller('votes')
export class VotesController {
  constructor(private votesService: VotesService) {}

  @Put(':quoteId')
  @HttpCode(HttpStatus.OK)
  async createOrUpdateVote(
    @User() user: UserPayload,
    @Param() createVoteDto: CreateVoteDto,
  ) {
    createVoteDto.userId = user.id;
    return await this.votesService.createOrUpdate(createVoteDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVote(@User() user: UserPayload) {
    return await this.votesService.deleteVote(user.id);
  }
}
