import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vote } from '../src/votes/entities/vote.entity';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';

describe('Votes System (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let votesRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  const user = { id: 'user-1', username: 'testuser' };
  const tokenPayload = { sub: user.id, username: user.username };
  let accessToken: string;

  beforeAll(async () => {
    votesRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Vote))
      .useValue(votesRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    jwtService = moduleFixture.get<JwtService>(JwtService);
    accessToken = jwtService.sign(tokenPayload);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/votes/:quoteId (PUT)', () => {
    it('should create or update a vote', async () => {
      const quoteId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const mockVote = {
        id: 'vote-1',
        user: { id: user.id, username: user.username },
        quote: { id: quoteId },
        createdAt: new Date(),
      };

      const mockQueryBuilder: any = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ raw: { affectedRows: 1 } }),
      };

      votesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      votesRepository.findOne.mockResolvedValue(mockVote);

      return request(app.getHttpServer())
        .put(`/votes/${quoteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res: { body: { id: string; quote: { id: string } } }) => {
          expect(res.body.id).toBe(mockVote.id);
          expect(res.body.quote.id).toBe(quoteId);
        });
    });

    it('should return 400 if vote creation fails', async () => {
      const quoteId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const mockQueryBuilder: any = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(null),
      };

      votesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      return request(app.getHttpServer())
        .put(`/votes/${quoteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('/votes (DELETE)', () => {
    it('should delete a vote', async () => {
      const mockVote = {
        id: 'vote-1',
        user: { id: user.id },
      };

      votesRepository.findOne.mockResolvedValueOnce(mockVote);
      votesRepository.delete.mockResolvedValueOnce({ affected: 1 });

      return request(app.getHttpServer())
        .delete('/votes')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 400 if vote not found', async () => {
      votesRepository.findOne.mockResolvedValueOnce(null);

      return request(app.getHttpServer())
        .delete('/votes')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
